'use server'

import { asc, eq } from 'drizzle-orm'
import { auth, clerkClient } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'

export const user_update = async (body: any) => {
	try {
		const { userId } = auth()

		if (!userId) return { status: 'ERROR', message: 'User is not authorized.' }

		const metadata = await getUserMetadata()

		const data = await db
			.update(schema.user)
			.set(body)
			.where(eq(schema.user.auth_id, userId))
			.returning({ id: schema.user.id })

		if (body.currency) {
			await clerkClient.users.updateUserMetadata(userId, {
				publicMetadata: {
					...metadata,
					currency: body.currency,
					...('is_onboarded' in body && { is_onboarded: body.is_onboarded }),
				},
			})
		}

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}
