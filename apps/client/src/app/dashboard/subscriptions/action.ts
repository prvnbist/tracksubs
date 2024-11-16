'use server'

import { z } from 'zod'
import dayjs from 'dayjs'
import { revalidatePath } from 'next/cache'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import { PLANS } from 'consts'
import { actionClient } from 'server_utils'
import type { ISubscription } from 'types'

export const transaction_create = actionClient
	.schema(
		z.object({
			amount: z.number(),
			currency: z.string(),
			id: z.string(),
			next_billing_date: z.string(),
			paidOn: z.string(),
			paymentMethodId: z.string().optional(),
		})
	)
	.action(
		async ({ parsedInput: subscription, ctx: { user_id } }) => {
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

			return transaction
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscriptions_list = actionClient
	.schema(
		z.object({
			interval: z.union([
				z.literal('ALL'),
				z.literal('MONTHLY'),
				z.literal('QUARTERLY'),
				z.literal('YEARLY'),
			]),
		})
	)
	.action(
		async ({ parsedInput: { interval }, ctx: { user_id } }) => {
			const intervals = sql.join(
				interval === 'ALL' ? ['MONTHLY', 'QUARTERLY', 'YEARLY'] : [interval],
				sql`,`
			)

			const rawColumns = (columns: Array<string>) =>
				sql.join(
					columns.map(col => sql.raw(col)),
					sql`,`
				)

			const subquery_columns = rawColumns([
				's.id',
				's.user_id',
				's.title',
				's.website',
				's.currency',
				's.amount',
				's.next_billing_date',
				's.interval',
				's.email_alert',
				's.is_active',
				's.service',
				's.payment_method_id',
				's.split_strategy',
				'c.id AS c_id',
				'c.amount AS c_amount',
				'c.percentage AS c_percentage',
				'c.user_id AS c_user_id',
				'c.email_alert AS c_email_alert',
				'u.id AS u_id',
				'u.first_name AS u_first_name',
				'u.last_name AS u_last_name',
				'u.image_url AS u_image_url',
			])

			const columns = rawColumns([
				'id',
				'user_id',
				'title',
				'website',
				'currency',
				'amount',
				'next_billing_date',
				'interval',
				'email_alert',
				'is_active',
				'service',
				'payment_method_id',
				'split_strategy',
			])

			const collaboratorsQuery = sql.raw(
				`COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id',c_id,'amount',c_amount,'percentage',c_percentage,'user_id',c_user_id,'email_alert',c_email_alert,'user',JSON_BUILD_OBJECT('id',u_id,'first_name',u_first_name,'last_name',u_last_name,'image_url',u_image_url))) FILTER (WHERE c_id IS NOT NULL),'[]') AS collaborators`
			)

			const result = await db.execute<ISubscription>(
				sql`with filtered_subscriptions as (SELECT ${subquery_columns} FROM SUBSCRIPTION AS s LEFT JOIN collaborator AS c ON c.subscription_id = s.id LEFT JOIN "user" AS u ON u.id = c.user_id WHERE (s.user_id = ${user_id} OR c.user_id = ${user_id}) AND s.interval IN (${intervals})) SELECT ${columns}, ${collaboratorsQuery} FROM filtered_subscriptions GROUP BY ${columns} ORDER BY is_active DESC, next_billing_date ASC;`
			)

			if (!result.rows) throw Error('SERVER_ERROR')

			return result.rows
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscriptions_create = actionClient
	.schema(schema.NewSubscription.omit({ user_id: true }))
	.action(
		async ({ parsedInput: body, ctx: { user_id, plan } }) => {
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

			return data
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscriptions_update = actionClient
	.schema(z.object({ id: z.string(), body: schema.NewSubscription }))
	.action(
		async ({ parsedInput: { id, body }, ctx: { user_id } }) => {
			return await db
				.update(schema.subscription)
				.set({ ...body, user_id })
				.where(and(eq(schema.subscription.user_id, user_id), eq(schema.subscription.id, id)))
				.returning({ id: schema.subscription.id })
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscriptions_active = actionClient
	.schema(z.object({ id: z.string(), is_active: z.boolean() }))
	.action(
		async ({ parsedInput: { id, is_active }, ctx: { user_id } }) => {
			return await db
				.update(schema.subscription)
				.set({ is_active })
				.where(and(eq(schema.subscription.user_id, user_id), eq(schema.subscription.id, id)))
				.returning({
					id: schema.subscription.id,
					is_active: schema.subscription.is_active,
					title: schema.subscription.title,
				})
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscriptions_delete = actionClient.schema(z.object({ id: z.string() })).action(
	async ({ parsedInput: { id }, ctx: { user_id } }) => {
		const data = await db
			.delete(schema.subscription)
			.where(and(eq(schema.subscription.id, id), eq(schema.subscription.user_id, user_id)))
			.returning({
				id: schema.subscription.id,
				title: schema.subscription.title,
				email_alert: schema.subscription.email_alert,
			})

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

		return data?.[0]
	},
	{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
)

export const subscription_alert = actionClient
	.schema(z.object({ id: z.string(), email_alert: z.boolean() }))
	.action(
		async ({ parsedInput: { id, email_alert }, ctx: { user_id, plan } }) => {
			if (email_alert) {
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
				.set({ email_alert })
				.where(and(eq(schema.subscription.id, id), eq(schema.subscription.user_id, user_id)))
				.returning({
					id: schema.subscription.id,
					email_alert: schema.subscription.email_alert,
					title: schema.subscription.title,
				})

			await db
				.update(schema.usage)
				.set({
					total_alerts: email_alert
						? sql`${schema.usage.total_alerts} + 1`
						: sql`${schema.usage.total_alerts} - 1`,
				})
				.where(eq(schema.usage.user_id, user_id))

			return data
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscription_export = actionClient
	.schema(z.object({ columns: z.record(z.string(), z.string()) }))
	.action(async ({ parsedInput: { columns }, ctx: { user_id, plan } }) => {
		if (plan === 'FREE') throw Error('Exporting subscriptions is only available for paid plans.')

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

		return data
	})

const CollaboratorsSchema = z.object({
	amount: z.number(),
	percentage: z.number(),
	user_id: z.string(),
})

export const manage_collaborators = actionClient
	.schema(
		z.object({
			subscription_id: z.string(),
			split_strategy: z.union([
				z.literal('EQUALLY'),
				z.literal('UNEQUALLY'),
				z.literal('PERCENTAGE'),
			]),
			collaborators: z.array(CollaboratorsSchema),
		})
	)
	.action(
		async ({
			ctx: { user_id },
			parsedInput: { collaborators, split_strategy, subscription_id },
		}) => {
			try {
				const subscription = await db.query.subscription.findFirst({
					with: {
						collaborators: {
							columns: {
								id: true,
								user_id: true,
								amount: true,
								percentage: true,
							},
						},
					},
					where: and(
						eq(schema.subscription.id, subscription_id),
						eq(schema.subscription.user_id, user_id)
					),
				})

				if (!subscription) throw Error('SUBSCRIPTION_NOT_FOUND')

				const added: Array<{
					amount: number
					percentage: string
					subscription_id: string
					user_id: string
				}> = []
				const removed: Array<string> = []
				const changes: Array<{ id: string; amount?: number; percentage?: string }> = []

				if (subscription.collaborators.length === 0) {
					for (const collaborator of collaborators) {
						const amount = Math.trunc(collaborator.amount * 100)
						const percentage = collaborator.percentage.toFixed(2)
						added.push({ amount, percentage, subscription_id, user_id: collaborator.user_id })
					}
				} else {
					const previous_map = new Map(subscription.collaborators.map(c => [c.user_id, c]))

					for (const [user_id, previous] of previous_map) {
						if (collaborators.findIndex(c => c.user_id === user_id) === -1) {
							removed.push(previous.id)
						}
					}

					for (const collaborator of collaborators) {
						const old = previous_map.get(collaborator.user_id)

						const amount = Math.trunc(collaborator.amount * 100)
						const percentage = collaborator.percentage.toFixed(2)

						if (!old) {
							added.push({
								amount,
								percentage,
								subscription_id,
								user_id: collaborator.user_id,
							})
							continue
						}

						const hasAmountChanged = old.amount !== amount
						const hasPercentageChanged = Number(old.percentage) !== Number(percentage)

						if (!hasAmountChanged && !hasPercentageChanged) continue

						changes.push({
							id: old.id,
							...(hasAmountChanged && { amount, percentage: '0.00' }),
							...(hasPercentageChanged && { amount: 0, percentage }),
						})
					}
				}

				if (added.length === 0 && removed.length === 0 && changes.length === 0)
					throw Error('NO_CHANGES')

				if (added.length > 0) {
					const count = await db.$count(
						schema.user,
						inArray(
							schema.user.id,
							added.map(c => c.user_id)
						)
					)

					if (added.length !== count) throw Error('COLLABORATOR_NOT_FOUND')

					const users = await db.query.user.findMany({
						columns: { id: true, plan: true },
						with: { usage: { columns: { total_subscriptions: true } } },
						where: inArray(
							schema.user.id,
							added.map(c => c.user_id)
						),
					})

					for (const user of users) {
						const plan = user.plan
						if (
							plan === 'FREE' &&
							user.usage.total_subscriptions === PLANS[plan].subscriptions
						) {
							throw Error('COLLABORATOR_SUBSCRIPTION_LIMIT_EXCEEDED')
						}
					}
				}

				await db.transaction(async tx => {
					if (subscription.split_strategy !== split_strategy) {
						await tx
							.update(schema.subscription)
							.set({ split_strategy })
							.where(eq(schema.subscription.id, subscription_id))
					}

					if (removed.length > 0) {
						const removed_collaborators = await tx
							.delete(schema.collaborator)
							.where(inArray(schema.collaborator.id, removed))
							.returning({
								email_alert: schema.collaborator.email_alert,
								user_id: schema.collaborator.user_id,
							})

						for (const collaborator of removed_collaborators) {
							await tx
								.update(schema.usage)
								.set({
									...(collaborator.email_alert && {
										total_alerts: sql`${schema.usage.total_alerts} - 1`,
									}),
									total_subscriptions: sql`${schema.usage.total_subscriptions} - 1`,
								})
								.where(eq(schema.usage.user_id, collaborator.user_id))
						}
					}

					if (added.length > 0) {
						await tx.insert(schema.collaborator).values(added)

						await tx
							.update(schema.usage)
							.set({
								total_subscriptions: sql`${schema.usage.total_subscriptions} + 1`,
							})
							.where(
								inArray(
									schema.usage.user_id,
									added.map(c => c.user_id)
								)
							)
					}

					if (changes.length > 0) {
						await Promise.all(
							changes.map(async ({ id, ...rest }) => {
								await tx
									.update(schema.collaborator)
									.set(rest)
									.where(eq(schema.collaborator.id, id))
							})
						)
					}
				})

				revalidatePath('dashboard/subscriptions')
			} catch (error) {
				throw Error('SERVER_ERROR')
			}
		}
	)
