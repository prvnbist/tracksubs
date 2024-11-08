import dayjs from 'dayjs'
import { flattenValidationErrors } from 'next-safe-action'

import { MONTHS } from 'consts'
import type { ISubscription, IMinimalUser } from 'types'

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

const updateMonthByAmount = (acc: Record<string, number>, month: string, amount: number) => {
	acc[month] ??= 0
	acc[month] += amount
}

type CalculateMonthlyOverviewArgs = Array<{
	amount: number
	next_billing_date: string
	interval: ISubscription['interval']
}>

export const calculateMonthlyOverview = (
	data: CalculateMonthlyOverviewArgs
): Record<string, number> => {
	return data.reduce((acc, curr) => {
		const { interval, next_billing_date, amount } = curr
		const monthIndex = dayjs(next_billing_date).month()

		switch (interval) {
			case 'MONTHLY': {
				for (const month of MONTHS) {
					updateMonthByAmount(acc, month, amount)
				}
				break
			}
			case 'YEARLY': {
				const month = MONTHS[monthIndex]!
				updateMonthByAmount(acc, month, amount)
				break
			}
			case 'QUARTERLY': {
				const counts = Array.from({ length: 3 }, (_, i) => i + 1)

				const futureMonths = counts
					.map(count => monthIndex + count * 3)
					.filter(sum => sum <= 11)

				const pastMonths = counts.map(count => monthIndex - count * 3).filter(sum => sum >= 0)

				const quarterlyMonths = [...pastMonths, monthIndex, ...futureMonths]

				for (const quarterlyMonthIndex of quarterlyMonths) {
					const month = MONTHS[quarterlyMonthIndex]!
					updateMonthByAmount(acc, month, amount)
				}

				break
			}
		}

		return acc
	}, {})
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
