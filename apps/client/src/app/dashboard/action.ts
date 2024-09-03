'use server'

import dayjs from 'dayjs'
import { auth } from '@clerk/nextjs/server'
import { and, asc, count, eq, sql } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'
import type { ActionResponse, ISubscription } from 'types'

export type GetCurrenciesReturn = Array<{ currency: string }>

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

export type GetMonthlyOverviewReturn = Array<{
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
