'use server'

import { z } from 'zod'
import dayjs from 'dayjs'
import { revalidatePath } from 'next/cache'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import db, { insertSubscriptionSchema, schema, selectSubscriptionSchema } from '@tracksubs/drizzle'

import { PLANS } from 'consts'

import { actionClient } from 'utils'

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
	.outputSchema(z.array(selectSubscriptionSchema))
	.action(
		async ({ parsedInput: { interval }, ctx: { user_id } }) => {
			return db.query.subscription.findMany({
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
		},
		{ onSuccess: () => revalidatePath('dashboard/subscriptions') }
	)

export const subscriptions_create = actionClient
	.schema(insertSubscriptionSchema.omit({ user_id: true }))
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
	.schema(z.object({ id: z.string(), body: insertSubscriptionSchema }))
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

		return data
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
