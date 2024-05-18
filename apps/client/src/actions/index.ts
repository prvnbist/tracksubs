'use server'

import dayjs from 'dayjs'
import { auth, clerkClient } from '@clerk/nextjs'

import knex from '@tracksubs/db'

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

		const data = await knex('user')
			.leftJoin('usage', 'user.usage_id', 'usage.id')
			.select(
				'user.id',
				'first_name',
				'last_name',
				'email',
				'auth_id',
				'is_onboarded',
				'timezone',
				'currency',
				'image_url',
				'usage_id',
				'plan',
				'usage.total_alerts',
				'usage.total_subscriptions'
			)
			.where('auth_id', userId)
			.first()

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

		const data = await knex('user')
			.where('auth_id', userId)
			.update(body)
			.returning<{ id: string }>('id')

		if (body.currency) {
			await clerkClient.users.updateUserMetadata(userId, {
				publicMetadata: {
					...metadata,
					currency: body.currency,
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
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex
			.select(
				'id',
				'title',
				'website',
				'amount',
				'currency',
				'interval',
				'user_id',
				'service',
				'is_active',
				'email_alert',
				'next_billing_date',
				'payment_method_id'
			)
			.from('subscription')
			.where('user_id', user_id)
			.andWhere(builder =>
				builder.whereIn(
					'interval',
					interval === 'ALL' ? ['MONTHLY', 'QUARTERLY', 'YEARLY'] : [interval]
				)
			)
			.orderBy('is_active', 'desc')
			.orderBy('next_billing_date', 'asc')

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_create = async (body: any): ActionResponse<{ id: string }, string> => {
	try {
		const { plan, user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const user_plan = PLANS[plan]!

		const usage = await knex('usage')
			.where('user_id', user_id)
			.select('total_subscriptions')
			.first()

		if (usage.total_subscriptions === user_plan?.subscriptions) {
			return {
				status: 'ERROR',
				message: `Selected plan allows you to create upto ${user_plan.subscriptions} subscriptions. Please change your plan to the one that fits your needs.`,
			}
		}

		const data = await knex('subscription')
			.insert({ ...body, user_id })
			.returning('id')

		await knex('usage').where('user_id', user_id).increment({
			total_subscriptions: 1,
		})

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_update = async (
	id: string,
	body: any
): ActionResponse<{ id: string }, string> => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription').where('id', id).update(body).returning('id')

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_delete = async (id: string): ActionResponse<{ id: string }, string> => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription')
			.where('id', id)
			.andWhere('user_id', user_id)
			.del()
			.returning('id')

		await knex('usage').where('user_id', user_id).decrement({
			total_subscriptions: 1,
		})

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscription_alert = async (
	id: string,
	enabled: boolean
): ActionResponse<{ id: string }, string> => {
	try {
		const { plan, user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		if (enabled) {
			const user_plan = PLANS[plan]!

			const usage = await knex('usage').where('user_id', user_id).select('total_alerts').first()

			if (usage.total_alerts === user_plan?.alerts) {
				return {
					status: 'ERROR',
					message: `Selected plan allows upto ${user_plan.alerts} alerts. Please change your plan to the one that fits your needs.`,
				}
			}
		}

		const data = await knex('subscription')
			.where('id', id)
			.andWhere('user_id', user_id)
			.update({ email_alert: enabled })
			.returning('id')

		if (enabled) {
			await knex('usage').where('user_id', user_id).increment({
				total_alerts: 1,
			})
		} else {
			await knex('usage').where('user_id', user_id).decrement({
				total_alerts: 1,
			})
		}

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscription_export = async (
	columns: Record<string, string>
): ActionResponse<Array<Partial<ISubscription> & { payment_method: string }>, string> => {
	try {
		const { plan, user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		if (plan === 'FREE')
			return {
				status: 'ERROR',
				message: 'Exporting subscriptions is only available for paid plans.',
			}

		const data = await knex('subscription')
			.select(
				`title as ${columns.title}`,
				`website as ${columns.website}`,
				`amount as ${columns.amount}`,
				`currency as ${columns.currency}`,
				`frequency as ${columns.frequency}`,
				`interval as ${columns.interval}`,
				`is_active as ${columns.is_active}`,
				`next_billing_date as ${columns.next_billing_date}`
			)
			.where('user_id', user_id)
			.orderBy('next_billing_date', 'asc')

		return {
			status: 'SUCCESS',
			data: data.map(datum => ({
				...datum,
				[columns.amount!]: datum[columns.amount!] / 100,
				[columns.next_billing_date!]: dayjs(datum[columns.next_billing_date!]).format(
					'YYYY-MM-DD'
				),
			})),
		}
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const services = async (): ActionResponse<Record<string, Service>, string> => {
	try {
		const data = await knex
			.select('id', 'key', ' title', 'website')
			.from('service')
			.orderBy('title', 'asc')

		return {
			status: 'SUCCESS',
			data: data.reduce((acc, curr) => {
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
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('payment_method')
			.select('id', 'title')
			.where('user_id', user_id)
			.orderBy('title', 'asc')

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_create = async (formData: FormData) => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('payment_method')
			.insert({ title: formData.get('title'), user_id })
			.returning('id')

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_delete = async (id: string) => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('payment_method')
			.where('user_id', user_id)
			.andWhere('id', id)
			.del()
			.returning('id')

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const transaction_create = async (
	subscription: ISubscription & { paidOn: Date; paymentMethodId?: string }
): ActionResponse<null, string> => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		await knex.transaction(async trx => {
			await trx('transaction')
				.insert({
					user_id,
					amount: subscription.amount,
					currency: subscription.currency,
					subscription_id: subscription.id,
					...(subscription.payment_method_id && {
						payment_method_id: subscription.paymentMethodId,
					}),
					invoice_date: dayjs(subscription.next_billing_date).format('YYYY-MM-DD'),
					paid_date: dayjs(subscription.paidOn).format('YYYY-MM-DD'),
				})
				.returning('id')

			await trx('subscription')
				.where('id', subscription.id)
				.andWhere('user_id', subscription.user_id)
				.update({
					next_billing_date: dayjs(subscription.next_billing_date)
						.add(30, 'day')
						.format('YYYY-MM-DD'),
				})
				.returning('id')
		})

		return { status: 'SUCCESS', data: null }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const transaction_list = async (): ActionResponse<Transaction[], string> => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('transaction')
			.leftJoin('subscription', 'transaction.subscription_id', 'subscription.id')
			.leftJoin('payment_method', 'transaction.payment_method_id', 'payment_method.id')
			.select(
				'transaction.id',
				'transaction.amount',
				'transaction.currency',
				'transaction.invoice_date',
				'transaction.paid_date',
				'transaction.payment_method_id',
				'transaction.subscription_id',
				'subscription.title',
				'subscription.service',
				'payment_method.title as payment_method'
			)

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const waitlist_add = async (email: string): ActionResponse<{ email: string }, string> => {
	try {
		const data = await knex('waitlist').insert({ email }).returning('id')

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		if ((error as Error).message.includes('waitlist_email_unique')) {
			return { status: 'ERROR', message: `ALREADY_ADDED` }
		}

		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

type GetCurrenciesReturn = Array<{ currency: string }>

export const getCurrencies = async (): ActionResponse<GetCurrenciesReturn, string> => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription')
			.where('user_id', user_id)
			.select('currency')
			.orderBy('currency', 'asc')
			.distinct()
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
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const startOfCurrentMonth = dayjs().startOf('month')
		const endOfLastMonthNextYear = dayjs().add(1, 'year').subtract(1, 'month').endOf('month')

		const data = await knex('subscription')
			.select('amount', 'interval', 'next_billing_date')
			.where({ user_id, currency, is_active: true })
			.andWhereRaw(`next_billing_date >= ? and next_billing_date <= ?`, [
				startOfCurrentMonth.format('YYYY-MM-DD'),
				endOfLastMonthNextYear.format('YYYY-MM-DD'),
			])

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const getActiveSubscriptions = async (
	currency: string
): ActionResponse<{ active: number; total: number }, string> => {
	try {
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription').select('is_active').where({ user_id, currency })

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
		const { user_id } = await getUserMetadata()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const startOfWeek = dayjs().startOf('week')
		const endOfWeek = dayjs().endOf('week')

		const this_week = await knex('subscription')
			.count()
			.where({ user_id, currency, is_active: true })
			.andWhereRaw(`next_billing_date >= ? and next_billing_date <= ?`, [
				startOfWeek.format('YYYY-MM-DD'),
				endOfWeek.format('YYYY-MM-DD'),
			])
			.first<{ count: number }>()

		const startOfMonth = dayjs().startOf('month')
		const endOfMonth = dayjs().endOf('month')

		const this_month = await knex('subscription')
			.count()
			.where({ user_id, currency, is_active: true })
			.andWhereRaw(`next_billing_date >= ? and next_billing_date <= ?`, [
				startOfMonth.format('YYYY-MM-DD'),
				endOfMonth.format('YYYY-MM-DD'),
			])
			.first<{ count: number }>()

		return {
			status: 'SUCCESS',
			data: { this_week: this_week.count, this_month: this_month.count },
		}
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}
