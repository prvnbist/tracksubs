'use server'

import dayjs from 'dayjs'
import { auth } from '@clerk/nextjs'
import weekday from 'dayjs/plugin/weekday'
import type { JwtPayload } from '@clerk/types'

import knex from 'lib/db'
import type { ActionResponse, ISubscription, Service, User } from 'types'

dayjs.extend(weekday)

export const user = async (): ActionResponse<User> => {
	const { userId } = auth()
	try {
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
		return data
	} catch (error) {
		throw new Error('Failed to fetch the user.')
	}
}

export const user_update = async (body: any) => {
	const { userId } = auth()
	try {
		const data = await knex('user').where('auth_id', userId).update(body).returning('id')
		return data
	} catch (error) {
		throw new Error('Failed to update the user!')
	}
}

export const subscriptions_list = async (
	userId: string,
	interval: string = 'ALL'
): ActionResponse<ISubscription[]> => {
	try {
		const result = await knex
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
			.where('user_id', userId)
			.andWhere(builder =>
				builder.whereIn(
					'interval',
					interval === 'ALL' ? ['MONTHLY', 'QUARTERLY', 'YEARLY'] : [interval]
				)
			)
			.orderBy('is_active', 'desc')
			.orderBy('next_billing_date', 'asc')
		return result
	} catch (error) {
		throw new Error('Failed to fetch the subscriptions')
	}
}

export const subscriptions_create = async (body: any) => {
	try {
		const result = await knex('subscription').returning('id').insert(body)

		return { status: 'SUCCESS', data: result }
	} catch (error) {
		return { status: 'ERROR', data: null }
	}
}

export const subscriptions_delete = async (id: string) => {
	try {
		const result = await knex('subscription').where('id', id).del(['id'])

		return { status: 'SUCCESS', data: result }
	} catch (error) {
		return { status: 'ERROR', data: null }
	}
}

export const subscriptions_analytics_weekly = async (user_id: string) => {
	try {
		const data = await knex('subscription')
			.select('currency')
			.count()
			.sum('amount')
			.groupBy('currency')
			.where('user_id', '=', user_id)
			.andWhere('is_active', '=', true)
			.andWhere('next_billing_date', '>', dayjs().weekday(0).format('YYYY-MM-DD'))
			.andWhere('next_billing_date', '<=', dayjs().weekday(7).format('YYYY-MM-DD'))
		return data
	} catch (error) {
		throw new Error('Failed to fetch weekly subscriptions data.')
	}
}

export const subscriptions_analytics_top_five_most_expensive = async (user_id: string) => {
	try {
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

		return transformed
	} catch (error) {
		throw new Error('Failed to fetch top five most expensive subscriptions.')
	}
}

export const services = async (): ActionResponse<Record<string, Service>> => {
	try {
		const data = await knex
			.select('id', 'key', ' title', 'website')
			.from('service')
			.orderBy('title', 'asc')

		return data.reduce((acc, curr) => {
			acc[curr.key] = curr
			return acc
		}, {})
	} catch (error) {
		throw new Error('Failed to fetch services.')
	}
}

type SessionClaim = JwtPayload & { metadata: { user_id: string } }

export const payment_method_list = async () => {
	try {
		const { sessionClaims } = auth()
		const user_id = (sessionClaims as SessionClaim)?.metadata?.user_id

		if (!user_id) throw new Error('Not authorized')

		const data = await knex('payment_method')
			.select('id', 'title')
			.where('user_id', user_id)
			.orderBy('title', 'asc')

		return data
	} catch (error) {
		const message = (error as Error).message
		throw new Error(message)
	}
}

export const payment_method_create = async (formData: FormData) => {
	try {
		const { sessionClaims } = auth()
		const user_id = (sessionClaims as SessionClaim)?.metadata?.user_id

		if (!user_id) throw new Error('Not authorized')

		const result = await knex('payment_method')
			.returning('id')
			.insert({ title: formData.get('title'), user_id })

		return result
	} catch (error) {
		throw new Error('Failed to save payment method.')
	}
}

export const payment_method_delete = async (id: string) => {
	try {
		const { sessionClaims } = auth()
		const user_id = (sessionClaims as SessionClaim)?.metadata?.user_id

		if (!user_id) throw new Error('Not authorized')

		const result = await knex('payment_method')
			.where('user_id', user_id)
			.andWhere('id', id)
			.returning('id')
			.del()

		return result
	} catch (error) {
		throw new Error('Failed to delete payment method.')
	}
}
