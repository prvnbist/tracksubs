'use server'

import { z } from 'zod'
import dayjs from 'dayjs'
import { zfd } from 'zod-form-data'
import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'
import { and, eq, or, type SQL, sql } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import { MONTHS } from 'consts'
import { actionClient } from 'server_utils'
import type { ICollaborator } from 'types'

export const onboard = actionClient
	.schema(
		zfd.formData({
			currency: zfd.text(z.string({ message: 'Currency is required.' })),
			timezone: zfd.text(z.string({ message: 'Timezone is required.' })),
		})
	)
	.action(async ({ parsedInput: body, ctx: { authId, ...metadata } }) => {
		try {
			const currency = body.currency
			const timezone = body.timezone

			const data = await db
				.update(schema.user)
				.set({ currency, timezone, is_onboarded: true })
				.where(eq(schema.user.auth_id, authId))
				.returning({ id: schema.user.id })

			await clerkClient().users.updateUserMetadata(authId, {
				publicMetadata: {
					...metadata,
					currency,
					timezone,
					is_onboarded: true,
				},
			})

			revalidatePath('/dashboard', 'layout')

			return data[0]
		} catch (error) {
			throw new Error('USER_ONBOARDING_ERROR')
		}
	})

export const activeSubscriptions = actionClient
	.schema(
		z.object({
			currency: z.string(),
		})
	)
	.action(async ({ parsedInput: { currency }, ctx: { user_id } }) => {
		const userFilter: SQL | undefined = or(
			eq(schema.subscription.user_id, user_id),
			eq(schema.collaborator.user_id, user_id)
		)

		const currencyFilter: SQL = eq(schema.subscription.currency, currency)

		const query = db
			.select({ count: sql<number>`count(distinct subscription.id)` })
			.from(schema.subscription)
			.leftJoin(
				schema.collaborator,
				eq(schema.collaborator.subscription_id, schema.subscription.id)
			)

		const total_data = await query.where(and(userFilter, currencyFilter))
		const total = total_data?.[0]?.count ?? 0

		const activeFilter: SQL = eq(schema.subscription.is_active, true)

		const active_data = await query.where(and(userFilter, currencyFilter, activeFilter))
		const active = active_data?.[0]?.count ?? 0

		return { total, active }
	})

export const renewingSubscriptions = actionClient
	.schema(
		z.object({
			currency: z.string(),
		})
	)
	.action(async ({ parsedInput: { currency }, ctx: { user_id } }) => {
		const startOfWeek = dayjs().startOf('week')
		const endOfWeek = dayjs().endOf('week')

		const userFilter: SQL | undefined = or(
			eq(schema.subscription.user_id, user_id),
			eq(schema.collaborator.user_id, user_id)
		)

		const commonFilters: SQL[] = [
			eq(schema.subscription.currency, currency),
			eq(schema.subscription.is_active, true),
		]

		const weekFilter = sql`next_billing_date >= ${startOfWeek.format(
			'YYYY-MM-DD'
		)} and next_billing_date <= ${endOfWeek.format('YYYY-MM-DD')}`

		const [this_week] = await db
			.select({ count: sql<number>`count(distinct subscription.id)` })
			.from(schema.subscription)
			.leftJoin(
				schema.collaborator,
				eq(schema.collaborator.subscription_id, schema.subscription.id)
			)
			.where(and(userFilter, ...commonFilters, weekFilter))

		const startOfMonth = dayjs().startOf('month')
		const endOfMonth = dayjs().endOf('month')

		const monthFilter = sql`next_billing_date >= ${startOfMonth.format(
			'YYYY-MM-DD'
		)} and next_billing_date <= ${endOfMonth.format('YYYY-MM-DD')}`

		const [this_month] = await db
			.select({ count: sql<number>`count(distinct subscription.id)` })
			.from(schema.subscription)
			.leftJoin(
				schema.collaborator,
				eq(schema.collaborator.subscription_id, schema.subscription.id)
			)
			.where(and(userFilter, ...commonFilters, monthFilter))

		return {
			this_week: this_week?.count ?? 0,
			this_month: this_month?.count ?? 0,
		}
	})

export const monthlyOverview = actionClient
	.schema(
		z.object({
			currency: z.string(),
		})
	)
	.action(async ({ parsedInput: { currency }, ctx: { user_id } }) => {
		const startOfCurrentMonth = dayjs().startOf('month')
		const endOfLastMonthNextYear = dayjs().add(1, 'year').subtract(1, 'month').endOf('month')

		const dateRangeFilter = sql`next_billing_date >= ${startOfCurrentMonth.format(
			'YYYY-MM-DD'
		)} and next_billing_date <= ${endOfLastMonthNextYear.format('YYYY-MM-DD')}`

		const data = await db
			.select({
				id: sql<number>`count(distinct subscription.id)`,
				amount: schema.subscription.amount,
				interval: schema.subscription.interval,
				next_billing_date: schema.subscription.next_billing_date,
				collaborators: sql<
					Array<ICollaborator>
				>`COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id',collaborator.id,'amount',collaborator.amount,'user_id',collaborator.user_id)) FILTER (WHERE collaborator.id IS NOT NULL),'[]')`,
			})
			.from(schema.subscription)
			.leftJoin(
				schema.collaborator,
				eq(schema.collaborator.subscription_id, schema.subscription.id)
			)
			.where(
				and(
					or(
						eq(schema.subscription.user_id, user_id),
						eq(schema.collaborator.user_id, user_id)
					),
					eq(schema.subscription.currency, currency),
					eq(schema.subscription.is_active, true),
					dateRangeFilter
				)
			)
			.groupBy(
				schema.subscription.amount,
				schema.subscription.interval,
				schema.subscription.next_billing_date
			)

		const months = new Map(MONTHS.map(month => [month, 0]))

		const processAmount = (subscription: {
			id: number
			amount: number
			interval: string
			next_billing_date: string
			collaborators: ICollaborator[]
		}) => {
			const share = subscription.collaborators.find(
				collaborator => collaborator.user_id === user_id
			)

			return share ? share.amount / 100 : subscription.amount / 100
		}

		for (const datum of data) {
			const monthIndex = dayjs(datum.next_billing_date).month()

			if (datum.interval === 'MONTHLY') {
				for (const month of MONTHS) {
					months.set(month, (months.get(month) ?? 0) + processAmount(datum))
				}
			} else if (datum.interval === 'YEARLY') {
				const month = MONTHS[monthIndex]!

				months.set(month, (months.get(month) ?? 0) + processAmount(datum))
			} else if (datum.interval === 'QUARTERLY') {
				const counts = Array.from({ length: 3 }, (_, i) => i + 1)

				const futureMonths = counts
					.map(count => monthIndex + count * 3)
					.filter(sum => sum <= 11)

				const pastMonths = counts.map(count => monthIndex - count * 3).filter(sum => sum >= 0)

				const quarterlyMonths = [...pastMonths, monthIndex, ...futureMonths]

				for (const quarterlyMonthIndex of quarterlyMonths) {
					const month = MONTHS[quarterlyMonthIndex]!

					months.set(month, (months.get(month) ?? 0) + processAmount(datum))
				}
			}
		}

		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		const nextYear = dayjs().add(1, 'year').year()

		const mapper = (month: any, year: number) => ({
			Month: `${month} ${currentYear.toString().replace('20', '')}`,
			Amount: months.get(month) ?? 0,
		})

		const result = [
			...[...months.keys()].slice(currentMonth).map(month => mapper(month, currentYear)),
			...[...months.keys()].slice(0, currentMonth).map(month => mapper(month, nextYear)),
		]

		return result
	})
