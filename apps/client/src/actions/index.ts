'use server'

import { asc } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import type { IService } from 'types'
import { actionClient } from 'server_utils'

export const user = actionClient.action(async ({ ctx: { authId } }) => {
	try {
		const data = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.auth_id, authId),
			with: {
				usage: true,
				payment_methods: true,
			},
		})

		if (!data) throw new Error('USER_NOT_FOUND')

		return data
	} catch (error) {
		throw new Error((error as Error).message)
	}
})

export const contacts = actionClient.action(async ({ ctx: { user_id } }) => {
	try {
		const data = await db.query.contact.findMany({
			with: {
				sender: {
					columns: {
						id: true,
						first_name: true,
						last_name: true,
						image_url: true,
						email: true,
					},
				},
				receiver: {
					columns: {
						id: true,
						first_name: true,
						last_name: true,
						image_url: true,
						email: true,
					},
				},
			},
			where: (contact, { eq, or }) =>
				or(eq(contact.sender_id, user_id), eq(contact.receiver_id, user_id)),
		})

		if (!Array.isArray(data)) throw new Error('CONTACTS_NOT_FOUND')

		return data
	} catch (error) {
		throw new Error((error as Error).message)
	}
})

export const services = actionClient.action(async () => {
	try {
		const data = await db.query.service.findMany({
			orderBy: asc(schema.service.title),
		})

		if (!data) return {}

		return data.reduce((acc: Record<string, IService>, curr) => {
			acc[curr.key] = curr
			return acc
		}, {})
	} catch (error) {
		throw new Error('Something went wrong!')
	}
})
