import dayjs from 'dayjs'
import { Resend } from '@trigger.dev/resend'
import { cronTrigger } from '@trigger.dev/sdk'
import { and, eq, inArray } from 'drizzle-orm'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import db, { schema } from '@tracksubs/drizzle'

import { client } from 'trigger'
import RenewalAlert from 'emails/RenewalAlert'
import { TIMEZONES_DISPLAY } from 'constants/index'

type Subscription = {
	subscription_id: string
	subscription_title: string
	subscription_amount: number
	subscription_currency: string
	subscription_next_billing_date: string
	user_id: string
	user_email: string
	user_timezone: string | null
	user_first_name: string | null
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

			return db
				.select({
					subscription_id: schema.subscription.id,
					subscription_title: schema.subscription.title,
					subscription_amount: schema.subscription.amount,
					subscription_currency: schema.subscription.currency,
					subscription_next_billing_date: schema.subscription.next_billing_date,
					user_id: schema.user.id,
					user_email: schema.user.email,
					user_timezone: schema.user.timezone,
					user_first_name: schema.user.first_name,
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
						eq(schema.subscription.email_alert, true),
						eq(schema.subscription.next_billing_date, tomorrow)
					)
				)
		})

		if (Array.isArray(result) && result.length === 0) return

		await io.runTask('process-emails', async () => {
			const groupedByEmail = Object.values(
				result.reduce((acc: GroupByEmail, curr) => {
					const { user_email: email, user_first_name: first_name } = curr

					const item = acc[email]

					if (item) {
						item.list.push(curr)
					} else {
						acc[email] = { email, first_name: first_name ?? '', list: [curr] }
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
									id: datum.subscription_id,
									title: datum.subscription_title,
									amount: datum.subscription_amount,
									currency: datum.subscription_currency,
								})),
							}),
						})
					} catch (error) {}
				})
			)
		})
	},
})
