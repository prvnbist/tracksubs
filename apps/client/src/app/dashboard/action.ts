'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import { actionClient } from 'server_utils'

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

			await clerkClient().users.updateUserMetadata(authId, {
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
