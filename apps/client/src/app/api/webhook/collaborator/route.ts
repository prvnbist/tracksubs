import { Resend } from 'resend'
import { eq } from 'drizzle-orm'

import db, { schema } from '@tracksubs/drizzle'

import Common from 'emails/collaborators/Common'
import Changed from 'emails/collaborators/Changed'

type Interval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export async function POST(request: Request) {
	const payload = await request.json()

	const token = request.headers.get('Supabase-Token')

	if (!token) return Response.json({ error: 'Missing headers.' }, { status: 400 })

	if (token !== process.env.SUPABASE_WEBHOOK_TOKEN)
		return Response.json({ error: 'Unauthorized' }, { status: 401 })

	const [subscription] = await db
		.select({
			amount: schema.subscription.amount,
			currency: schema.subscription.currency,
			interval: schema.subscription.interval,
			next_billing_date: schema.subscription.next_billing_date,
			title: schema.subscription.title,
			user: {
				first_name: schema.user.first_name,
			},
		})
		.from(schema.subscription)
		.leftJoin(schema.user, eq(schema.user.id, schema.subscription.user_id))
		.where(eq(schema.subscription.id, payload.record.subscription_id))

	if (!subscription)
		return Response.json({ error: 'No such subscription exists' }, { status: 400 })

	const collaborator = await db.query.user.findFirst({
		columns: { email: true, first_name: true },
		where: eq(schema.user.id, payload.record.user_id || payload.old_record.user_id),
	})

	if (!collaborator)
		return Response.json({ error: 'No such collaborator exists' }, { status: 400 })

	if (['INSERT', 'DELETE'].includes(payload.type)) {
		const { record, old_record } = payload

		if (process.env.NODE_ENV === 'production') {
			const resend = new Resend(process.env.RESEND_API_KEY)

			const subject = `You've been ${payload.type === 'INSERT' ? 'added' : 'removed'} as a collaborator on ${subscription.title} by ${subscription.user?.first_name}`

			await resend.emails.send({
				from: 'Notifications | TrackSubs <notifications@tracksubs.co>',
				to: collaborator.email,
				subject,
				react: Common({
					collaboratorName: collaborator.first_name!,
					collaboratorShare: payload.type === 'INSERT' ? record.amount : old_record.amount,
					ownerName: subscription.user?.first_name!,
					subscriptionAmount: subscription.amount,
					subscriptionCurrency: subscription.currency,
					subscriptionInterval: subscription.interval as Interval,
					subscriptionNextBillingDate: subscription.next_billing_date,
					subscriptionTitle: subscription.title,
					type: payload.type === 'INSERT' ? 'ADDED' : 'REMOVED',
				}),
			})
		}
	} else if (payload.type === 'UPDATE') {
		const { record, old_record } = payload

		if (record.email_alert !== old_record.email_alert)
			return Response.json({ message: 'Received' })

		if (process.env.NODE_ENV === 'production') {
			const resend = new Resend(process.env.RESEND_API_KEY)

			await resend.emails.send({
				from: 'Notifications | TrackSubs <notifications@tracksubs.co>',
				to: collaborator.email,
				subject: `Your share has been updated in subscription ${subscription.title} by ${subscription.user?.first_name}`,
				react: Changed({
					fromShare: old_record.amount / 100,
					toShare: record.amount / 100,
					collaboratorName: collaborator.first_name!,
					ownerName: subscription.user?.first_name!,
					subscriptionTitle: subscription.title,
					subscriptionCurrency: subscription.currency,
					subscriptionAmount: subscription.amount,
				}),
			})
		}
	}

	return Response.json({ message: 'Received' })
}
