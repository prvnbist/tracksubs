import timezones from './timezones.json'

export const CYCLES = [
	{ value: 'MONTHLY', label: 'Monthly' },
	{ value: 'QUARTERLY', label: 'Quarterly' },
	{ value: 'YEARLY', label: 'Yearly' },
]

let currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' })
export const CURRENCIES = Intl.supportedValuesOf('currency')
	.map(c => ({
		value: c,
		label: currencyNames.of(c) ?? '',
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
