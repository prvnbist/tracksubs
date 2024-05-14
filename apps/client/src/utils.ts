export const currencyFormatter = (amount = 0, currency = 'INR') =>
	Intl.NumberFormat('en-US', {
		currency,
		style: 'currency',
		maximumFractionDigits: 2,
	}).format(amount)

export const downloadCSV = (csv: string, name: string = 'data') => {
	const blob = new Blob([csv], { type: 'text/plain' })
	const a = document.createElement('a')
	a.download = `${name}.csv`
	a.href = window.URL.createObjectURL(blob)
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}
