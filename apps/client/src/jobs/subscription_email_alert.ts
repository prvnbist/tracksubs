import dayjs from 'dayjs'
import { Resend } from '@trigger.dev/resend'
import { cronTrigger } from '@trigger.dev/sdk'
import { and, eq, inArray } from 'drizzle-orm'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import db, { schema } from '@tracksubs/drizzle'

import { client } from 'trigger'
import RenewalAlert from 'emails/RenewalAlert'
import { TIMEZONES_DISPLAY } from 'consts'

type Subscription = {
	subscription: {
		id: string
		title: string
		amount: number
		currency: string
		next_billing_date: string
	}
	user: {
		id: string
		email: string
		first_name: string | null
	}
}

type GroupByEmail = Record<string, { first_name: string; email: string; list: Array<Subscription> }>

const resend = new Resend({
	id: 'resend',
	apiKey: process.env.RESEND_API_KEY,
})

client.defineJob({
	version: '0.0.4',
	integrations: { resend },
	id: 'subscription_email_alert',
	name: 'Subscription Reminder Alert',
	trigger: cronTrigger({ cron: '0 */3 * * *' }),
	enabled: process.env.NODE_ENV === 'production',
	run: async (payload, io) => {
		const result = await io.runTask('get-subscriptions', async () => {
			dayjs.extend(utc)
			dayjs.extend(timezone)

			const today = dayjs.utc().format('YYYY-MM-DDTHH:MM:ssZ')
			const tomorrow = dayjs.utc().add(1, 'day').format('YYYY-MM-DD')

			const timezones = TIMEZONES_DISPLAY.reduce((acc: Array<string>, curr) => {
				const hour = dayjs.utc(today).tz(curr.timezone).hour()

				if (hour >= 9 && hour < 12) acc.push(curr.timezone)

				return acc
			}, [])

			let result = await db
				.select({
					subscription: {
						id: schema.subscription.id,
						title: schema.subscription.title,
						amount: schema.subscription.amount,
						currency: schema.subscription.currency,
						next_billing_date: schema.subscription.next_billing_date,
					},
					user: {
						id: schema.user.id,
						email: schema.user.email,
						first_name: schema.user.first_name,
					},
				})
				.from(schema.subscription)
				.innerJoin(
					schema.user,
					and(
						eq(schema.subscription.user_id, schema.user.id),
						inArray(schema.user.timezone, timezones)
					)
				)
				.where(
					and(
						eq(schema.subscription.is_active, true),
						// TODO: in case of collaborators, for the owner of the subscription collaborator.email_alert should be considered
						eq(schema.subscription.email_alert, true),
						eq(schema.subscription.next_billing_date, tomorrow)
					)
				)

			result = (
				await Promise.all(
					result.map(async subscription => {
						const collaborators = await db
							.select({
								user: {
									id: schema.user.id,
									email: schema.user.email,
									first_name: schema.user.first_name,
								},
								collaborator: {
									amount: schema.collaborator.amount,
								},
							})
							.from(schema.collaborator)
							.leftJoin(schema.user, eq(schema.user.id, schema.collaborator.user_id))
							.where(
								and(
									eq(schema.collaborator.subscription_id, subscription.subscription.id),
									eq(schema.collaborator.email_alert, true)
								)
							)

						if (collaborators.length === 0) return subscription

						const result = collaborators.map(c => ({
							subscription: { ...subscription.subscription, amount: c.collaborator.amount },
							user: c.user!,
						}))
						return result
					})
				)
			).flat()

			return result
		})

		if (Array.isArray(result) && result.length === 0) return

		await io.runTask('process-emails', async () => {
			const groupedByEmail = Object.values(
				result.reduce((acc: GroupByEmail, curr) => {
					const { user } = curr

					const item = acc[user.email]

					if (item) {
						item.list.push(curr)
					} else {
						acc[user.email] = {
							email: user.email,
							first_name: user.first_name ?? '',
							list: [curr],
						}
					}

					return acc
				}, {})
			)

			await Promise.all(
				groupedByEmail.map(async group => {
					try {
						await io.resend.emails.send('send-email', {
							from: 'Subscription Reminder | TrackSubs <reminder@tracksubs.co>',
							to: group.email,
							subject: 'You have subscription/s renewing tomorrow',
							react: RenewalAlert({
								firstName: group.first_name,
								subscriptions: group.list.map(datum => ({
									id: datum.subscription.id,
									title: datum.subscription.title,
									amount: datum.subscription.amount,
									currency: datum.subscription.currency,
								})),
							}),
						})
					} catch (error) {}
				})
			)
		})
	},
})
