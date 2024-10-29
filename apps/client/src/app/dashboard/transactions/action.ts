'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'

const actionClient = createSafeActionClient({
	handleServerError(e) {
		if (e instanceof Error) {
			return e.message
		}

		return DEFAULT_SERVER_ERROR_MESSAGE
	},
}).use(async ({ next }) => {
	const { userId: authId } = auth()

	if (!authId) {
		throw new Error('User is not authorized.')
	}

	const metadata = await getUserMetadata()

	return next({ ctx: { authId, ...metadata } })
})

export const transaction_list = actionClient.action(async ({ ctx: { user_id } }) => {
	try {
		const data = await db
			.select({
				id: schema.transaction.id,
				amount: schema.transaction.amount,
				currency: schema.transaction.currency,
				invoice_date: schema.transaction.invoice_date,
				paid_date: schema.transaction.paid_date,
				title: schema.subscription.title,
				service: schema.subscription.service,
				payment_method: schema.payment_method.title,
				user_id: schema.transaction.user_id,
				subscription_id: schema.transaction.subscription_id,
				payment_method_id: schema.transaction.payment_method_id,
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

		return data
	} catch (error) {
		throw new Error('TRANSACTION_LIST_ERROR')
	}
})
