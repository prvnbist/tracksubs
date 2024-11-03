'use server'

import { z } from 'zod'
import { and, eq, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import db, { schema } from '@tracksubs/drizzle'

import { actionClient } from 'server_utils'

export const remove = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput: { id }, ctx: { user_id } }) => {
		const result = await db
			.delete(schema.contact)
			.where(
				and(
					eq(schema.contact.id, id),
					or(eq(schema.contact.sender_id, user_id), eq(schema.contact.receiver_id, user_id))
				)
			)
			.returning({ id: schema.contact.id })

		revalidatePath('/dashboard/settings/contacts')

		return result?.[0]
	})

export const undo = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput: { id }, ctx: { user_id } }) => {
		const result = await db
			.delete(schema.contact)
			.where(and(eq(schema.contact.id, id), eq(schema.contact.sender_id, user_id)))
			.returning({ id: schema.contact.id })

		revalidatePath('/dashboard/settings/contacts')

		return result?.[0]
	})

export const accept = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput: { id }, ctx: { user_id } }) => {
		const result = await db
			.update(schema.contact)
			.set({ status: 'ACCEPTED', resolved_at: new Date() })
			.where(and(eq(schema.contact.id, id), eq(schema.contact.receiver_id, user_id)))
			.returning({ id: schema.contact.id })

		revalidatePath('/dashboard/settings/contacts')

		return result?.[0]
	})

export const reject = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput: { id }, ctx: { user_id } }) => {
		const result = await db
			.delete(schema.contact)
			.where(and(eq(schema.contact.id, id), eq(schema.contact.receiver_id, user_id)))
			.returning({ id: schema.contact.id })

		revalidatePath('/dashboard/settings/contacts')

		return result?.[0]
	})
