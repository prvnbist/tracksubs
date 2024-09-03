'use server'

import { eq } from 'drizzle-orm'
import { auth, clerkClient } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import type { ActionResponse } from 'types'

export const onboard = async (
	formData: FormData
): ActionResponse<Array<{ id: string }>, string> => {
	const currency = formData.get('currency') as string
	const timezone = formData.get('timezone') as string

	try {
		const { userId, sessionClaims } = auth()

		if (!userId) return { status: 'ERROR', message: 'User is not authorized.' }

		const data = await db
			.update(schema.user)
			.set({ currency, timezone, is_onboarded: true })
			.where(eq(schema.user.auth_id, userId))
			.returning({ id: schema.user.id })

		await clerkClient.users.updateUserMetadata(userId, {
			publicMetadata: {
				...sessionClaims.metadata,
				currency,
				is_onboarded: true,
			},
		})

		return { status: 'SUCCESS', data }
	} catch (error) {
		return { status: 'ERROR', message: 'Something went wrong!' }
	}
}
