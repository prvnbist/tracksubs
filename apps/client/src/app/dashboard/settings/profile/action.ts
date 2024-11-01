'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'

import db, { schema } from '@tracksubs/drizzle'

import { actionClient } from 'server_utils'

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

			await clerkClient().users.updateUser(authId, {
				firstName: body.first_name,
				lastName: body.last_name,
			})

			await clerkClient().users.updateUserMetadata(authId, {
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
