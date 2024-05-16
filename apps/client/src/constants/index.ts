import type { Plan } from 'types'
import timezones from './timezones.json'

export const CYCLES = [
	{ value: 'MONTHLY', label: 'Monthly' },
	{ value: 'QUARTERLY', label: 'Quarterly' },
	{ value: 'YEARLY', label: 'Yearly' },
]

export const CURRENCY_NAMES = new Intl.DisplayNames(['en'], { type: 'currency' })
export const CURRENCIES = Intl.supportedValuesOf('currency')
	.map(c => ({
		value: c,
		label: CURRENCY_NAMES.of(c) ?? '',
	}))
	.sort((a, b) => a.label.localeCompare(b.label))

export const TIMEZONES = timezones

const NEGATIVE_TIMEZONES = Object.values(timezones).filter(t => t.gmt_offset.includes('-'))
const NEUTRAL_TIMEZONES = Object.values(timezones).filter(t => t.gmt_offset.includes('+00:00'))
const POSITIVE_TIMEZONES = Object.values(timezones).filter(
	t => !t.gmt_offset.includes('+00:00') && t.gmt_offset.includes('+')
)

export const TIMEZONES_DISPLAY: Array<{
	code: string
	name: string
	timezone: string
	gmt_offset: string
}> = [
	...NEGATIVE_TIMEZONES.sort((a, b) => b.gmt_offset.localeCompare(a.gmt_offset)),
	...NEUTRAL_TIMEZONES.sort((a, b) => a.timezone.localeCompare(b.timezone)),
	...POSITIVE_TIMEZONES.sort((a, b) => a.gmt_offset.localeCompare(b.gmt_offset)),
]

export const PLANS: Record<string, Plan> = {
	FREE: {
		title: 'Free',
		price: {
			amount: 0,
			currency: 'USD',
		},
		alerts: 3,
		subscriptions: 10,
	},
	BASIC: {
		title: 'Basic',
		price: {
			amount: 4.99,
			currency: 'USD',
		},
		alerts: 20,
		subscriptions: 20,
	},
	PRO: {
		title: 'Pro',
		price: {
			amount: 9.99,
			currency: 'USD',
		},
		alerts: 50,
		subscriptions: 50,
	},
}

export const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sept',
	'Oct',
	'Nov',
	'Dec',
] as const