export const currencyFormatter = (amount = 0, currency = 'INR') =>
	Intl.NumberFormat('en-US', {
		currency,
		style: 'currency',
		maximumFractionDigits: 2,
	}).format(amount)
