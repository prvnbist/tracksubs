import dayjs from 'dayjs'
import { Resend } from '@trigger.dev/resend'
import { cronTrigger } from '@trigger.dev/sdk'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import knex from '@tracksubs/db'

import { client } from 'trigger'
import RenewalAlert from 'emails/RenewalAlert'
import { TIMEZONES_DISPLAY } from 'constants/index'

type Subscription = {
	subscription_id: string
	subscription_title: string
	subscription_amount: number
	subscription_currency: string
	subscription_next_billing_date: Date
	user_id: string
	user_email: string
	user_timezone: string
	user_first_name: string
}

type GroupByEmail = Record<string, { first_name: string; email: string; list: Array<Subscription> }>

const resend = new Resend({
	id: 'resend',
	apiKey: process.env.RESEND_API_KEY,
})

client.defineJob({
	version: '0.0.3',
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

			const COLUMNS = [
				's.id as subscription_id',
				's.title as subscription_title',
				's.amount as subscription_amount',
				's.currency as subscription_currency',
				's.next_billing_date as subscription_next_billing_date',
				'u.id as user_id',
				'u.email as user_email',
				'u.timezone as user_timezone',
				'u.first_name as user_first_name',
			]

			return await knex('subscription as s')
				.innerJoin('user as u', function () {
					this.on('s.user_id', '=', 'u.id').andOnIn('u.timezone', timezones)
				})
				.select(...COLUMNS)
				.where({ 's.is_active': true, 's.email_alert': true })
				.andWhere('s.next_billing_date', tomorrow)
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
						acc[email] = { email, first_name, list: [curr] }
					}

					return acc
				}, {})
			)

			await Promise.all(
				groupedByEmail.map(async group => {
					try {
						await io.runTask('log-email', async () => {
							await Promise.all(
								group.list.map(async datum => {
									await knex('subscription_reminder_log').insert({
										amount: datum.subscription_amount,
										currency: datum.subscription_currency,
										renewal_date: datum.subscription_next_billing_date,
										user_id: datum.user_id,
										subscription_id: datum.subscription_id,
										timezone: datum.user_timezone,
										executed_at: dayjs.utc().format('YYYY-MM-DDTHH:MM:ssZ'),
									})
								})
							)
						})
					} catch (error) {}

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
