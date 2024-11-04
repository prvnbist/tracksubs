'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { and, eq, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import { actionClient } from 'server_utils'

export const add = actionClient
	.schema(
		zfd.formData({
			email: zfd.text(z.string()),
		})
	)
	.action(async ({ parsedInput: { email }, ctx: { user_id } }) => {
		const user = await currentUser()

		if (user?.emailAddresses?.[0]?.emailAddress === email) {
			throw new Error('SELF_EMAIL_ERROR')
		}

		const recipient = await db.query.user.findFirst({ where: eq(schema.user.email, email) })

		if (!recipient) {
			throw new Error('EMAIL_NOT_FOUND')
		}

		const contact = await db.query.contact.findFirst({
			where: or(
				and(
					eq(schema.contact.sender_id, user_id),
					eq(schema.contact.receiver_id, recipient.id)
				),
				and(eq(schema.contact.receiver_id, user_id), eq(schema.contact.sender_id, recipient.id))
			),
		})

		if (contact) {
			throw new Error('CONTACT_ALREADY_EXISTS')
		}

		const request = await db
			.insert(schema.contact)
			.values({
				sender_id: user_id,
				receiver_id: recipient.id,
			})
			.returning({ id: schema.contact.id })

		revalidatePath('/dashboard/settings/contacts')

		return request?.[0]
	})

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
