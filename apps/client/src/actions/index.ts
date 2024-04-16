'use server'

import dayjs from 'dayjs'
import { auth } from '@clerk/nextjs'
import weekday from 'dayjs/plugin/weekday'

import knex from 'lib/db'
import { ActionResponse, ISubscription } from 'types'

dayjs.extend(weekday)

export const user = async () => {
	const { userId } = auth()
	try {
		const data = await knex
			.select('id', 'first_name', ' last_name', 'email', 'auth_id')
			.from('user')
			.where('auth_id', userId)
			.first()
		return data
	} catch (error) {
		console.log(error)
	}
}

export const subscriptions_list = async (userId: string): ActionResponse<ISubscription[]> => {
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
				'next_billing_date',
				'payment_method_id'
			)
			.from('subscription')
			.where('user_id', userId)
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
			.andWhere('next_billing_date', '>', dayjs().weekday(0).format('YYYY-MM-DD'))
			.andWhere('next_billing_date', '<=', dayjs().weekday(7).format('YYYY-MM-DD'))
		return data
	} catch (error) {
		throw new Error('Failed to fetch weekly subscriptions data.')
	}
}

export const services = async () => {
	try {
		const data = await knex
			.select('id', 'key', ' title', 'website')
			.from('service')
			.orderBy('title', 'asc')
		return data
	} catch (error) {
		console.log(error)
	}
}
