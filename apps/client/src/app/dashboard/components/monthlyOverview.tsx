import { IconAlertTriangle } from '@tabler/icons-react'

import { Center, Stack, Title } from '@mantine/core'

import { monthlyOverview } from '../action'
import MonthlyOverviewChart from './monthlyOverviewChart'

const MonthlyOverview = async ({ currency, user_id }: { user_id: string; currency: string }) => {
	try {
		const data = await monthlyOverview({ currency })

		if (!data?.data || !Array.isArray(data.data)) throw Error()

		if (data.data.length === 0)
			return (
				<Center h={300}>
					<Title order={5}>No Data</Title>
				</Center>
			)
		return <MonthlyOverviewChart data={data.data} currency={currency} />
	} catch (error) {
		return (
			<Center h={300}>
				<Stack align="center" c="red">
					<IconAlertTriangle size={24} />
					<Title order={5}>Failed to load</Title>
				</Stack>
			</Center>
		)
	}
}

export default MonthlyOverview
