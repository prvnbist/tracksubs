export const SERVICES = [
	{
		key: 'amazon_prime',
		title: 'Amazon Prime',
		logo: '/services/amazon_prime.svg',
		website: 'https://www.primevideo.com',
	},
	{
		key: 'disney_plus',
		title: 'Disney Plus',
		logo: '/services/disney_plus.svg',
		website: 'https://www.disneyplus.com',
	},
	{
		key: 'hbo_max',
		title: 'HBO Max',
		logo: '/services/hbo_max.svg',
		website: 'https://www.max.com',
	},
	{ key: 'hulu', title: 'Hulu', logo: '/services/hulu.svg', website: 'https://www.hulu.com' },
	{
		key: 'netflix',
		title: 'Netflix',
		logo: '/services/netflix.svg',
		website: 'https://netflix.com',
	},
]

export const CYCLES = [
	{ value: 'MONTHLY', label: 'Monthly' },
	{ value: 'QUARTERLY', label: 'Quarterly' },
	{ value: 'YEARLY', label: 'yearly' },
]

let currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' })
export const CURRENCIES = Intl.supportedValuesOf('currency')
	.map(c => ({
		value: c,
		label: currencyNames.of(c) ?? '',
	}))
	.sort((a, b) => a.label.localeCompare(b.label))
