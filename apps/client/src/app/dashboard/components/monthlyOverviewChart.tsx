'use client'

import { BarChart } from '@mantine/charts'

import { currencyFormatter } from 'utils'

type MonthlyOverviewChartProps = {
	currency: string
	data: Array<{
		Amount: number
		Month: string
	}>
}

const MonthlyOverviewChart = ({ data, currency }: MonthlyOverviewChartProps) => {
	return (
		<BarChart
			h={300}
			data={data}
			dataKey="Month"
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
