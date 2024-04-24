'use server'

import dayjs from 'dayjs'
import { auth } from '@clerk/nextjs'
import weekday from 'dayjs/plugin/weekday'
import type { JwtPayload } from '@clerk/types'

import knex from 'lib/db'
import type { ActionResponse, ISubscription, PaymentMethod, Service, User } from 'types'

dayjs.extend(weekday)

export const user = async (): ActionResponse<User, string> => {
	try {
		const { userId } = auth()

		if (!userId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const data = await knex
			.select(
				'id',
				'first_name',
				'last_name',
				'email',
				'auth_id',
				'is_onboarded',
				'timezone',
				'currency',
				'image_url'
			)
			.from('user')
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

		if (!userId) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('user').where('auth_id', userId).update(body).returning('id')

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

type SessionClaim = JwtPayload & { metadata: { user_id: string } }

const getUserId = () => {
	const { sessionClaims } = auth()

	return (sessionClaims as SessionClaim)?.metadata?.user_id
}

export const subscriptions_list = async (
	interval: string = 'ALL'
): ActionResponse<ISubscription[], string> => {
	try {
		const user_id = getUserId()

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
		const user_id = getUserId()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription')
			.insert({ ...body, user_id })
			.returning('id')

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_delete = async (id: string): ActionResponse<{ id: string }, string> => {
	try {
		const user_id = getUserId()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription')
			.where('id', id)
			.andWhere('user_id', user_id)
			.del()
			.returning('id')

		return { status: 'SUCCESS', data: data?.[0] }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_analytics_weekly = async (): ActionResponse<
	Array<{ count: number; currency: string; sum: number }>,
	string
> => {
	try {
		const user_id = getUserId()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex('subscription')
			.select('currency')
			.count()
			.sum('amount')
			.groupBy('currency')
			.where('user_id', '=', user_id)
			.andWhere('is_active', '=', true)
			.andWhere('next_billing_date', '>', dayjs().weekday(0).format('YYYY-MM-DD'))
			.andWhere('next_billing_date', '<=', dayjs().weekday(7).format('YYYY-MM-DD'))

		return {
			status: 'SUCCESS',
			data: data.map(datum => ({
				currency: datum.currency,
				count: Number(datum.count),
				sum: Number(datum.sum),
			})),
		}
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const subscriptions_analytics_top_five_most_expensive = async (): ActionResponse<
	Record<string, Array<{ title: string; currency: string; interval: string; amount: number }>>,
	string
> => {
	try {
		const user_id = getUserId()

		if (!user_id) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await knex
			.with(
				'active_subscriptions',
				knex.raw(
					`SELECT amount, interval, currency, title FROM subscription WHERE user_id = ? AND is_active = true`,
					user_id
				)
			)
			.select(
				'title',
				'currency',
				'interval',
				knex.raw(
					`CASE WHEN interval = 'MONTHLY' THEN amount * 12 WHEN interval = 'QUARTERLY' THEN amount * 4 ELSE amount END AS amount`
				)
			)
			.from('active_subscriptions')
			.orderBy('amount', 'desc')

		const transformed = data.reduce((acc, curr) => {
			if (!(curr.currency in acc)) {
				acc[curr.currency] = [curr]
			} else {
				acc[curr.currency].push(curr)
			}
			return acc
		}, {})

		return { status: 'SUCCESS', data: transformed }
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
		const user_id = getUserId()

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
		const user_id = getUserId()

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
		const user_id = getUserId()

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
