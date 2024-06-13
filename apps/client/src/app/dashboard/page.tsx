import { Group, Paper, SimpleGrid, Space, Title } from '@mantine/core'

import {
	getActiveSubscriptions,
	getCurrencies,
	getMonthlyOverview,
	getThisWeekMonthSubscriptions,
	getUserMetadata,
} from 'actions'

import {
	ActiveSubscriptions,
	CurrencySelector,
	MonthlyOverview,
	RenewingSubscriptions,
} from './components'

interface IPageProps {
	searchParams: { currency?: string }
}

export default async function Page(props: IPageProps) {
	const { currency } = await getUserMetadata()

	const selectedCurrency = props.searchParams.currency ?? currency

	const first = await getCurrencies()
	const second = await getMonthlyOverview(selectedCurrency)
	const third = await getActiveSubscriptions(selectedCurrency)
	const four = await getThisWeekMonthSubscriptions(selectedCurrency)

	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Title order={2}>Dashboard</Title>
				{first.status === 'SUCCESS' && first.data.length > 0 && (
					<CurrencySelector currencies={first.data} selected={selectedCurrency} />
				)}
			</Group>
			{(third.data || four.data) && (
				<SimpleGrid mb={16} cols={{ base: 1, sm: 2 }}>
					{third.data && <ActiveSubscriptions data={third.data} />}
					{four.data && <RenewingSubscriptions data={four.data} />}
				</SimpleGrid>
			)}
			<Paper p="xl" withBorder shadow="md">
				<Title order={4}>Monthly Overview</Title>
				<Space h={24} />
				<MonthlyOverview
					data={second.data ?? []}
					currency={selectedCurrency}
					hasError={second.status === 'ERROR'}
				/>
			</Paper>
		</main>
	)
}
