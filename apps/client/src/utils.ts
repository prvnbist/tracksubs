import dayjs from 'dayjs'

import { MONTHS } from 'constants/index'
import type { ISubscription } from 'types'

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

const updateMonthByAmount = (acc: Record<string, number>, month: string, amount: number) => {
	if (month in acc) {
		acc[month] += amount
	} else {
		acc[month] = amount
	}
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
				MONTHS.forEach(month => {
					updateMonthByAmount(acc, month, amount)
				})
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

				quarterlyMonths.forEach(quarterlyMonthIndex => {
					const month = MONTHS[quarterlyMonthIndex]!
					updateMonthByAmount(acc, month, amount)
				})
				break
			}
		}

		return acc
	}, {})
}

export const track = async (name: string, payload?: Record<string, any>) => {
	try {
		await window.umami.track(name, payload ?? {})
		return
	} catch (e) {}
}