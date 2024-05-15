'use client'

import { useMemo } from 'react'

import { BarChart } from '@mantine/charts'
import { Paper, Space, Title } from '@mantine/core'

import { currencyFormatter } from 'utils'

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]

const MonthlyOverview = ({
	currency,
	data,
}: {
	currency: string
	data: Array<{ month: number; sum: number }>
}) => {
	const chartData = useMemo(() => {
		const byMonth = data.reduce((acc: Record<number, number>, curr) => {
			acc[curr.month] = curr.sum
			return acc
		}, [])

		return MONTHS.map((month, index) => {
			const sum = byMonth[index + 1]
			return { Month: month, Amount: Number(sum ?? 0) / 100 }
		})
	}, [data])
	return (
		<Paper p="xl" withBorder shadow="md">
			<Title order={4}>Monthly Overview</Title>
			<Space h={24} />
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
		</Paper>
	)
}

export default MonthlyOverview
