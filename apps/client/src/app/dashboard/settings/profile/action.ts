'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { asc, eq } from 'drizzle-orm'
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

export const user_update = actionClient
	.schema(
		zfd.formData({
			first_name: zfd.text(z.string().min(2, 'First name must be atleast 2 characters long.')),
			last_name: zfd.text(z.string().min(2, 'Last name must be atleast 2 characters long.')),
			currency: zfd.text(z.string()),
			timezone: zfd.text(z.string()),
		})
	)
	.action(async ({ parsedInput: body, ctx: { authId, ...metadata } }) => {
		try {
			const data = await db
				.update(schema.user)
				.set(body)
				.where(eq(schema.user.id, metadata.user_id))
				.returning({ id: schema.user.id })

			await clerkClient.users.updateUser(authId, {
				firstName: body.first_name,
				lastName: body.last_name,
			})

			await clerkClient.users.updateUserMetadata(authId, {
				publicMetadata: {
					...metadata,
					currency: body.currency,
					timezone: body.timezone,
				},
			})

			revalidatePath('/dashboard/settings/profile')

			return data[0]
		} catch (error) {
			throw new Error('USER_UPDATE_ERROR')
		}
	})
