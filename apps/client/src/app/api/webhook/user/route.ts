import { Webhook } from 'svix'
import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { clerkClient } from '@clerk/nextjs/server'
import type { WebhookEvent } from '@clerk/nextjs/server'

import db, { insertUserSchema, schema } from '@tracksubs/drizzle'

import UserSignUp from 'emails/UserSignUp'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || ''

async function validateRequest(request: Request) {
	const payloadString = await request.text()
	const headerPayload = headers()

	const svixHeaders = {
		'svix-id': headerPayload.get('svix-id')!,
		'svix-timestamp': headerPayload.get('svix-timestamp')!,
		'svix-signature': headerPayload.get('svix-signature')!,
	}
	const wh = new Webhook(CLERK_WEBHOOK_SECRET)
	return wh.verify(payloadString, svixHeaders) as WebhookEvent
}

export async function POST(request: Request) {
	try {
		const payload = await validateRequest(request)

		if (payload.type === 'user.created') {
			const { data } = payload
			const email_address = data.email_addresses?.[0]?.email_address ?? ''

			const values = insertUserSchema.parse({
				auth_id: data.id,
				email: email_address,
				first_name: data.first_name,
				last_name: data.last_name,
				...(data.has_image && { image_url: data.image_url }),
			})

			const [user] = await db
				.insert(schema.user)
				.values(values)
				.returning({ id: schema.user.id })

			if (!user) {
				throw Error()
			}

			if (user) {
				await clerkClient.users.updateUserMetadata(data.id, {
					publicMetadata: {
						user_id: user.id,
						plan: 'FREE',
						is_onboarded: false,
					},
				})
			}

			if (process.env.NODE_ENV === 'production') {
				const resend = new Resend(process.env.RESEND_API_KEY)

				await resend.emails.send({
					from: 'TrackSubs <onboard@tracksubs.co>',
					to: email_address,
					subject: 'Welcome to tracksubs.co',
					react: UserSignUp({ firstName: data.first_name ?? '' }),
				})
			}
		} else if (payload.type === 'user.deleted') {
			const id = payload.data.id

			if (id) {
				await db.delete(schema.user).where(eq(schema.user.auth_id, id))
			}
		}

		return Response.json({ message: 'Received' })
	} catch (e) {
		return Response.error()
	}
}
