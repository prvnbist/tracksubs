'use server'

import dayjs from 'dayjs'
import { auth } from '@clerk/nextjs/server'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import { PLANS } from 'constants/index'
import { getUserMetadata } from 'actions'
import type { ActionResponse, ISubscription } from 'types'

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
