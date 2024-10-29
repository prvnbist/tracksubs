'use client'

import dayjs from 'dayjs'
import { useMemo } from 'react'

import { BarChart } from '@mantine/charts'

import { MONTHS } from 'consts'
import { calculateMonthlyOverview, currencyFormatter } from 'utils'

const mapChartFn = (result: Record<string, number>, month: string, year: number) => {
	const amount = result[month] ?? 0
	return {
		Month: `${month} ${year.toString().replace('20', '')}`,
		Amount: Number(amount ?? 0) / 100,
	}
}

const MonthlyOverviewChart = ({
	data,
	currency,
}: {
	currency: string
	data: Array<{
		amount: number
		interval: string
		next_billing_date: string
	}>
}) => {
	const chartData = useMemo(() => {
		if (!data || data.length === 0) return []

		const result = calculateMonthlyOverview(data)

		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		const nextYear = dayjs().add(1, 'year').year()

		return [
			...MONTHS.slice(currentMonth).map(month => mapChartFn(result, month, currentYear)),
			...MONTHS.slice(0, currentMonth).map(month => mapChartFn(result, month, nextYear)),
		]
	}, [data])
	return (
		<BarChart
			h={300}
			dataKey="Month"
			data={chartData}
			xAxisLabel="Month"
			yAxisLabel="Total Amount"
			yAxisProps={{ width: 100 }}
			series={[{ name: 'Amount', color: 'yellow.4' }]}
			barProps={{ radius: [12, 12, 0, 0], maxBarSize: 24 }}
			valueFormatter={value => currencyFormatter(value, currency)}
		/>
	)
}

export default MonthlyOverviewChart
