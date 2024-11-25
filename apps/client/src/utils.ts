import { flattenValidationErrors } from 'next-safe-action'

import type { IMinimalUser } from 'types'

export const currencyFormatter = (amount = 0, currency = 'INR') =>
	Intl.NumberFormat('en-US', {
		currency,
		style: 'currency',
		maximumFractionDigits: 2,
	}).format(amount)

export const downloadCSV = (csv: string, name = 'data') => {
	const blob = new Blob([csv], { type: 'text/plain' })
	const a = document.createElement('a')
	a.download = `${name}.csv`
	a.href = window.URL.createObjectURL(blob)
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

export const track = async (name: string, payload?: Record<string, string | number | boolean>) => {
	if (process.env.NODE_ENV === 'development') return
	try {
		await window.umami.track(name, payload ?? {})
		return
	} catch (e) {}
}

export const getInitials = (phrase: string) => {
	if (!phrase.trim()) return ''

	const words = phrase.split(' ').filter(Boolean)

	if (words.length === 0) return ''

	let initials = ''

	for (let i = 0; i < Math.min(2, words.length); i++) {
		initials += words?.[i]?.charAt(0) ?? ''
	}

	return initials
}

export const flattenZodValidationErrors = (errors: any) =>
	Object.values(flattenValidationErrors(errors).fieldErrors).flatMap((e: any) => {
		if (Array.isArray(e)) return e
		return e._errors
	})

export const getUserName = (user: IMinimalUser) =>
	`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
