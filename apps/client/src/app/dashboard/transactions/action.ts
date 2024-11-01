'use server'

import { eq } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import { actionClient } from 'server_utils'

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
