'use client'

import { useMemo } from 'react'

import { BarChart } from '@mantine/charts'
import { Center, Title } from '@mantine/core'

import { MONTHS } from 'constants/index'
import { calculateMonthlyOverview, currencyFormatter } from 'utils'

type MonthlyOverviewProps = {
	currency: string
	data: Array<{
		amount: number
		next_billing_date: string
		interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
	}>
}

const MonthlyOverview = ({ currency, data }: MonthlyOverviewProps) => {
	const chartData = useMemo(() => {
		if (data.length === 0) return []

		const result = calculateMonthlyOverview(data)

		return MONTHS.map(month => {
			const amount = result[month] ?? 0
			return { Month: month, Amount: Number(amount ?? 0) / 100 }
		})
	}, [data])

	if (data.length === 0)
		return (
			<Center h={300}>
				<Title order={5}>No Data</Title>
			</Center>
		)
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

export default MonthlyOverview
