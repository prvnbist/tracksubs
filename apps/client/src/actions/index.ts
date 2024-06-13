'use server'

import dayjs from 'dayjs'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import { PLANS } from 'constants/index'
import type {
	ActionResponse,
	ISubscription,
	PaymentMethod,
	Service,
	SessionClaim,
	Transaction,
	User,
} from 'types'

export const getUserMetadata = async () => {
	const { sessionClaims } = auth()

	return (sessionClaims as SessionClaim)?.metadata
}

export const user = async (): ActionResponse<User, string> => {
	try {
		const { userId } = auth()

		if (!userId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const data = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.auth_id, userId),
			with: {
				usage: true,
			},
		})

		if (!data) return { status: 'ERROR', message: 'No such user found.' }

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const user_update = async (body: any) => {
	try {
		const { userId } = auth()
		const metadata = await getUserMetadata()

		if (!userId) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await db
			.update(schema.user)
			.set(body)
			.where(eq(schema.user.auth_id, userId))
			.returning({ id: schema.user.id })

		if (body.currency) {
			await clerkClient.users.updateUserMetadata(userId, {
				publicMetadata: {
					...metadata,
					currency: body.currency,
					...('is_onboarded' in body && { is_onboarded: body.is_onboarded }),
				},
			})
		}

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_list = async (
	interval: ISubscription['interval'] | 'ALL' = 'ALL'
): ActionResponse<ISubscription[], string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db.query.subscription.findMany({
			where: (subscription, { eq }) =>
				and(
					eq(subscription.user_id, user_id),
					inArray(
						subscription.interval,
						interval === 'ALL' ? ['MONTHLY', 'QUARTERLY', 'YEARLY'] : [interval]
					)
				),
			orderBy: (subscription, { asc, desc }) => [
				desc(subscription.is_active),
				asc(subscription.next_billing_date),
			],
		})

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_create = async (
	body: any
): ActionResponse<Array<{ id: string }>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { plan, user_id } = await getUserMetadata()

		const user_plan = PLANS[plan]!

		const usage = await db.query.usage.findFirst({
			where: (usage, { eq }) => eq(usage.user_id, user_id),
		})

		if (!usage) throw Error()

		if (usage.total_subscriptions === user_plan?.subscriptions) {
			return {
				status: 'ERROR',
				message: `Selected plan allows you to create upto ${user_plan.subscriptions} subscriptions. Please change your plan to the one that fits your needs.`,
			}
		}

		const data = await db
			.insert(schema.subscription)
			.values({ ...body, user_id })
			.returning({ id: schema.subscription.id })

		await db
			.update(schema.usage)
			.set({
				total_subscriptions: sql`${schema.usage.total_subscriptions} + 1`,
			})
			.where(eq(schema.usage.user_id, user_id))

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_update = async (
	id: string,
	body: any
): ActionResponse<Array<{ id: string }>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.update(schema.subscription)
			.set(body)
			.where(and(eq(schema.subscription.user_id, user_id), eq(schema.subscription.id, id)))
			.returning({ id: schema.subscription.id })

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_delete = async (
	id: string
): ActionResponse<Array<{ id: string }>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.delete(schema.subscription)
			.where(and(eq(schema.subscription.id, id), eq(schema.subscription.user_id, user_id)))
			.returning({ id: schema.subscription.id, email_alert: schema.subscription.email_alert })

		await db
			.update(schema.usage)
			.set({
				total_subscriptions: sql`${schema.usage.total_subscriptions} - 1`,
			})
			.where(eq(schema.usage.user_id, user_id))

		if (data?.[0]?.email_alert) {
			await db
				.update(schema.usage)
				.set({
					total_alerts: sql`${schema.usage.total_alerts} - 1`,
				})
				.where(eq(schema.usage.user_id, user_id))
		}

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscription_alert = async (
	id: string,
	enabled: boolean
): ActionResponse<Array<{ id: string }>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { plan, user_id } = await getUserMetadata()

		if (enabled) {
			const user_plan = PLANS[plan]!

			const usage = await db.query.usage.findFirst({
				where: eq(schema.usage.user_id, user_id),
			})

			if (!usage) throw Error()

			if (usage.total_alerts === user_plan?.alerts) {
				return {
					status: 'ERROR',
					message: `Selected plan allows upto ${user_plan.alerts} alerts. Please change your plan to the one that fits your needs.`,
				}
			}
		}

		const data = await db
			.update(schema.subscription)
			.set({ email_alert: enabled })
			.where(and(eq(schema.subscription.id, id), eq(schema.subscription.user_id, user_id)))
			.returning({ id: schema.subscription.id })

		await db
			.update(schema.usage)
			.set({
				total_alerts: enabled
					? sql`${schema.usage.total_alerts} + 1`
					: sql`${schema.usage.total_alerts} - 1`,
			})
			.where(eq(schema.usage.user_id, user_id))

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscription_export = async (
	columns: Record<string, string>
): ActionResponse<Array<Record<string, any>>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { plan, user_id } = await getUserMetadata()

		if (plan === 'FREE')
			return {
				status: 'ERROR',
				message: 'Exporting subscriptions is only available for paid plans.',
			}

		const data = await db
			.select({
				[`${columns.title}`]: schema.subscription.title,
				[`${columns.website}`]: schema.subscription.website,
				[`${columns.amount}`]: sql`${schema.subscription.amount} / 100`,
				[`${columns.currency}`]: schema.subscription.currency,
				[`${columns.next_billing_date}`]: sql`to_char(${schema.subscription.next_billing_date}, 'YYYY-MM-DD')`,
				[`${columns.interval}`]: schema.subscription.interval,
				[`${columns.is_active}`]: schema.subscription.is_active,
			})
			.from(schema.subscription)
			.where(eq(schema.subscription.user_id, user_id))
			.orderBy(desc(schema.subscription.is_active), asc(schema.subscription.next_billing_date))

		return { data, status: 'SUCCESS' }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const services = async (): ActionResponse<Record<string, Service>, string> => {
	try {
		const data = await db.query.service.findMany({
			orderBy: asc(schema.service.title),
		})

		return {
			status: 'SUCCESS',
			data: data.reduce((acc: Record<string, Service>, curr) => {
				acc[curr.key] = curr
				return acc
			}, {}),
		}
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_list = async (): ActionResponse<Array<PaymentMethod>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db.query.payment_method.findMany({
			where: eq(schema.payment_method.user_id, user_id),
			orderBy: asc(schema.payment_method.title),
		})

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_create = async (formData: FormData) => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const title = formData.get('title') as string

		const data = await db
			.insert(schema.payment_method)
			.values({ title, user_id })
			.returning({ id: schema.payment_method.id })

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_delete = async (id: string) => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.delete(schema.payment_method)
			.where(and(eq(schema.payment_method.user_id, user_id), eq(schema.payment_method.id, id)))
			.returning({ id: schema.payment_method.id })

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const transaction_create = async (
	subscription: ISubscription & { paidOn: string; paymentMethodId?: string }
): ActionResponse<null, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const transaction = await db
			.insert(schema.transaction)
			.values({
				amount: subscription.amount,
				currency: subscription.currency,
				invoice_date: dayjs(subscription.next_billing_date).format('YYYY-MM-DD'),
				paid_date: dayjs(subscription.paidOn).format('YYYY-MM-DD'),
				subscription_id: subscription.id,
				user_id,
				...(subscription.paymentMethodId && {
					payment_method_id: subscription.paymentMethodId,
				}),
			})
			.returning({ id: schema.transaction.id })

		if (transaction.length > 0) {
			const next_billing_date = dayjs(subscription.next_billing_date)
				.add(30, 'day')
				.format('YYYY-MM-DD')

			await db
				.update(schema.subscription)
				.set({ next_billing_date })
				.where(
					and(
						eq(schema.subscription.id, subscription.id),
						eq(schema.subscription.user_id, user_id)
					)
				)
				.returning({ id: schema.subscription.id })
		}

		return { status: 'SUCCESS', data: null }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

type ReturnTransction = Omit<
	Transaction,
	'user_id' | 'payment_method_id' | 'invoice_date' | 'subscription_id'
> & { payment_method: string | null; service: string | null; title: string | null }

export const transaction_list = async (): ActionResponse<ReturnTransction[], string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.select({
				id: schema.transaction.id,
				amount: schema.transaction.amount,
				currency: schema.transaction.currency,
				paid_date: schema.transaction.paid_date,
				title: schema.subscription.title,
				service: schema.subscription.service,
				payment_method: schema.payment_method.title,
			})
			.from(schema.transaction)
			.leftJoin(
				schema.subscription,
				eq(schema.transaction.subscription_id, schema.subscription.id)
			)
			.leftJoin(
				schema.payment_method,
				eq(schema.transaction.payment_method_id, schema.payment_method.id)
			)
			.where(eq(schema.transaction.user_id, user_id))

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const waitlist_add = async (
	email: string
): ActionResponse<Array<{ email: string }>, string> => {
	try {
		const data = await db
			.insert(schema.waitlist)
			.values({ email })
			.returning({ email: schema.waitlist.email })

		return { status: 'SUCCESS', data }
	} catch (error) {
		if ((error as Error).message.includes('waitlist_email_unique')) {
			return { status: 'ERROR', message: 'ALREADY_ADDED' }
		}

		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

type GetCurrenciesReturn = Array<{ currency: string }>

export const getCurrencies = async (): ActionResponse<GetCurrenciesReturn, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.selectDistinct({ currency: schema.subscription.currency })
			.from(schema.subscription)
			.where(eq(schema.subscription.user_id, user_id))
			.orderBy(asc(schema.subscription.currency))

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

type GetMonthlyOverviewReturn = Array<{
	amount: number
	next_billing_date: string
	interval: ISubscription['interval']
}>

export const getMonthlyOverview = async (
	currency: string
): ActionResponse<GetMonthlyOverviewReturn, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const startOfCurrentMonth = dayjs().startOf('month')
		const endOfLastMonthNextYear = dayjs().add(1, 'year').subtract(1, 'month').endOf('month')

		const data = await db.query.subscription.findMany({
			columns: {
				amount: true,
				interval: true,
				next_billing_date: true,
			},
			where: and(
				eq(schema.subscription.user_id, user_id),
				eq(schema.subscription.currency, currency),
				eq(schema.subscription.is_active, true),
				sql`next_billing_date >= ${startOfCurrentMonth.format(
					'YYYY-MM-DD'
				)} and next_billing_date <= ${endOfLastMonthNextYear.format('YYYY-MM-DD')}`
			),
		})

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const getActiveSubscriptions = async (
	currency: string
): ActionResponse<{ active: number; total: number }, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db.query.subscription.findMany({
			columns: { is_active: true },
			where: and(
				eq(schema.subscription.user_id, user_id),
				eq(schema.subscription.currency, currency)
			),
		})

		const active = data.filter(datum => datum.is_active).length

		return { status: 'SUCCESS', data: { active, total: data.length } }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const getThisWeekMonthSubscriptions = async (
	currency: string
): ActionResponse<{ this_week: number; this_month: number }, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const startOfWeek = dayjs().startOf('week')
		const endOfWeek = dayjs().endOf('week')

		const [this_week] = await db
			.select({ count: count() })
			.from(schema.subscription)
			.where(
				and(
					eq(schema.subscription.user_id, user_id),
					eq(schema.subscription.currency, currency),
					eq(schema.subscription.is_active, true),
					sql`next_billing_date >= ${startOfWeek.format(
						'YYYY-MM-DD'
					)} and next_billing_date <= ${endOfWeek.format('YYYY-MM-DD')}`
				)
			)

		const startOfMonth = dayjs().startOf('month')
		const endOfMonth = dayjs().endOf('month')

		const [this_month] = await db
			.select({ count: count() })
			.from(schema.subscription)
			.where(
				and(
					eq(schema.subscription.user_id, user_id),
					eq(schema.subscription.currency, currency),
					eq(schema.subscription.is_active, true),
					sql`next_billing_date >= ${startOfMonth.format(
						'YYYY-MM-DD'
					)} and next_billing_date <= ${endOfMonth.format('YYYY-MM-DD')}`
				)
			)

		return {
			status: 'SUCCESS',
			data: { this_week: this_week?.count ?? 0, this_month: this_month?.count ?? 0 },
		}
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}
