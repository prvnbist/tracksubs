'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'
import type { ActionResponse, Transaction } from 'types'

type ReturnTransction = Omit<
	Transaction,
	'user_id' | 'payment_method_id' | 'invoice_date' | 'subscription_id'
> & { payment_method: string | null; service: string | null; title: string | null }

export const transaction_list = async (): ActionResponse<ReturnTransction[], string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.select({
				id: schema.transaction.id,
				amount: schema.transaction.amount,
				currency: schema.transaction.currency,
				paid_date: schema.transaction.paid_date,
				title: schema.subscription.title,
				service: schema.subscription.service,
				payment_method: schema.payment_method.title,
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

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}