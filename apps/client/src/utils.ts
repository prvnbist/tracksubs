export const currencyFormatter = (amount = 0, currency = 'INR') =>
	Intl.NumberFormat('en-US', {
		currency,
		style: 'currency',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(amount)
