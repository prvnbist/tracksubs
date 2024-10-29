'use server'

import { asc, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { DEFAULT_SERVER_ERROR_MESSAGE, createSafeActionClient } from 'next-safe-action'

import db, { schema } from '@tracksubs/drizzle'

import type { Service } from 'types'

export const getUserMetadata = async () => {
	const { sessionClaims } = auth()

	return sessionClaims?.metadata!
}

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

	const { user_id: userId, plan } = await getUserMetadata()

	return next({ ctx: { authId, userId, plan } })
})

export const user = actionClient.action(async ({ ctx: { authId } }) => {
	try {
		const data = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.auth_id, authId),
			with: { usage: true },
		})

		if (!data) throw new Error('USER_NOT_FOUND')

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

		return data.reduce((acc: Record<string, Service>, curr) => {
			acc[curr.key] = curr
			return acc
		}, {})
	} catch (error) {
		throw new Error('Something went wrong!')
	}
})

export const payment_methods = actionClient.action(async ({ ctx: { userId } }) => {
	try {
		const data = await db.query.payment_method.findMany({
			where: eq(schema.payment_method.user_id, userId),
			orderBy: asc(schema.payment_method.title),
		})

		if (!data) return []

		return data
	} catch (error) {
		throw new Error('Something went wrong!')
	}
})
