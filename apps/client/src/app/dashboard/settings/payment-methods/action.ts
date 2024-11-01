'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import db, { schema } from '@tracksubs/drizzle'

import { actionClient } from 'server_utils'

export const payment_method_create = actionClient
	.schema(
		zfd.formData({
			title: zfd.text(z.string().min(2, 'Title must be atleast 2 characters long.')),
		})
	)
	.action(async ({ parsedInput: { title }, ctx: { user_id } }) => {
		try {
			const data = await db
				.insert(schema.payment_method)
				.values({ title, user_id })
				.returning({ id: schema.payment_method.id, title: schema.payment_method.title })

			revalidatePath('/dashboard/settings/payment-methods')

			return data[0]
		} catch (error) {
			throw new Error('PAYMENT_METHOD_CREATE_ERROR')
		}
	})

export const payment_method_delete = actionClient
	.schema(
		z.object({
			id: z.string(),
		})
	)
	.action(async ({ parsedInput: { id }, ctx: { user_id } }) => {
		try {
			const data = await db
				.delete(schema.payment_method)
				.where(
					and(eq(schema.payment_method.user_id, user_id), eq(schema.payment_method.id, id))
				)
				.returning({ id: schema.payment_method.id })

			revalidatePath('/dashboard/settings/payment-methods')

			return data
		} catch (error) {
			throw new Error('PAYMENT_METHOD_DELETE_ERROR')
		}
	})
