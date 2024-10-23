'use server'

import { asc, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import type { ActionResponse, PaymentMethod, Service, User } from 'types'

export const getUserMetadata = async () => {
	const { sessionClaims } = auth()

	return sessionClaims?.metadata!
}

export const user = async (): ActionResponse<User, string> => {
	try {
		const { userId } = auth()

		if (!userId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const data = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.auth_id, userId),
			with: {
				usage: true,
			},
		})

		if (!data) return { status: 'ERROR', message: 'No such user found.' }

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const services = async (): ActionResponse<Record<string, Service>, string> => {
	try {
		const data = await db.query.service.findMany({
			orderBy: asc(schema.service.title),
		})

		return {
			status: 'SUCCESS',
			data: data.reduce((acc: Record<string, Service>, curr) => {
				acc[curr.key] = curr
				return acc
			}, {}),
		}
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_list = async (): ActionResponse<Array<PaymentMethod>, string> => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db.query.payment_method.findMany({
			where: eq(schema.payment_method.user_id, user_id),
			orderBy: asc(schema.payment_method.title),
		})

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}
