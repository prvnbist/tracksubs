'use client'

import dayjs from 'dayjs'
import { use, useMemo } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'

import { BarChart } from '@mantine/charts'
import { Center, Stack, Title } from '@mantine/core'

import { MONTHS } from 'constants/index'
import type { ActionResponse, ISubscription } from 'types'
import { calculateMonthlyOverview, currencyFormatter } from 'utils'

import type { GetMonthlyOverviewReturn } from '../action'

type MonthlyOverviewProps = {
	currency: string
	data: ActionResponse<GetMonthlyOverviewReturn, string>
}

const mapChartFn = (result: Record<string, number>, month: string, year: number) => {
	const amount = result[month] ?? 0
	return {
		Month: `${month} ${year.toString().replace('20', '')}`,
		Amount: Number(amount ?? 0) / 100,
	}
}

const MonthlyOverview = ({ currency, data }: MonthlyOverviewProps) => {
	const subscriptions = use(data)

	const chartData = useMemo(() => {
		if (!subscriptions.data || subscriptions.data.length === 0) return []

		const result = calculateMonthlyOverview(subscriptions.data)

		const currentMonth = dayjs().month()
		const currentYear = dayjs().year()
		const nextYear = dayjs().add(1, 'year').year()

		return [
			...MONTHS.slice(currentMonth).map(month => mapChartFn(result, month, currentYear)),
			...MONTHS.slice(0, currentMonth).map(month => mapChartFn(result, month, nextYear)),
		]
	}, [subscriptions.data])

	if (subscriptions.status === 'ERROR')
		return (
			<Center h={300}>
				<Stack align="center" c="red">
					<IconAlertTriangle size={24} />
					<Title order={5}>Failed to load</Title>
				</Stack>
			</Center>
		)
	if (subscriptions.data?.length === 0)
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
