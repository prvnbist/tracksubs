import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { clerkClient } from '@clerk/nextjs'
import { WebhookEvent } from '@clerk/nextjs/server'

import knex from 'lib/db'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || ``

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
			const user = await knex('user')
				.insert({
					auth_id: data.id,
					email: email_address,
					first_name: data.first_name,
					last_name: data.last_name,
					...(data.has_image && { image_url: data.image_url }),
				})
				.returning('id')

			if (Array.isArray(user) && user.length > 0) {
				const { id } = user[0]
				await clerkClient.users.updateUserMetadata(data.id, {
					publicMetadata: {
						user_id: id,
					},
				})
			}

			// TODO: send welcome email
		}

		return Response.json({ message: 'Received' })
	} catch (e) {
		return Response.error()
	}
}
