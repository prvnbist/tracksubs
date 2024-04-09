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
