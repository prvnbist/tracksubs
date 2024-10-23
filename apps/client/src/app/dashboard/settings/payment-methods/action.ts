'use server'

import { and, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'

export const payment_method_create = async (formData: FormData) => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const title = formData.get('title') as string

		const data = await db
			.insert(schema.payment_method)
			.values({ title, user_id })
			.returning({ id: schema.payment_method.id })

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}

export const payment_method_delete = async (id: string) => {
	try {
		const { userId: authId } = auth()

		if (!authId) {
			return { status: 'ERROR', message: 'User is not authorized.' }
		}

		const { user_id } = await getUserMetadata()

		const data = await db
			.delete(schema.payment_method)
			.where(and(eq(schema.payment_method.user_id, user_id), eq(schema.payment_method.id, id)))
			.returning({ id: schema.payment_method.id })

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}
