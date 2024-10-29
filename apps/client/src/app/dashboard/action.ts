'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { DEFAULT_SERVER_ERROR_MESSAGE, createSafeActionClient } from 'next-safe-action'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'

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

	const metadata = await getUserMetadata()

	return next({ ctx: { authId, ...metadata } })
})

export const onboard = actionClient
	.schema(
		zfd.formData({
			currency: zfd.text(z.string({ message: 'Currency is required.' })),
			timezone: zfd.text(z.string({ message: 'Timezone is required.' })),
		})
	)
	.action(async ({ parsedInput: body, ctx: { authId, ...metadata } }) => {
		try {
			const currency = body.currency
			const timezone = body.timezone

			const data = await db
				.update(schema.user)
				.set({ currency, timezone, is_onboarded: true })
				.where(eq(schema.user.auth_id, authId))
				.returning({ id: schema.user.id })

			await clerkClient.users.updateUserMetadata(authId, {
				publicMetadata: {
					...metadata,
					currency,
					timezone,
					is_onboarded: true,
				},
			})

			revalidatePath('/dashboard', 'layout')

			return data[0]
		} catch (error) {
			console.error('ONBOARD', { error })
			throw new Error('USER_ONBOARDING_ERROR')
		}
	})
