import { redirect } from 'next/navigation'

import { Group, Paper, Space, Title } from '@mantine/core'

import { getCurrencies, getMonthlyOverview, getUserMetadata } from 'actions'

import { CurrencySelector, MonthlyOverview } from './components'

interface IPageProps {
	params: {}
	searchParams: { currency?: string }
}

export default async function Page(props: IPageProps) {
	const { currency } = await getUserMetadata()

	if (!props.searchParams.currency) return redirect(`/dashboard/?currency=${currency}`)

	const first = await getCurrencies()
	const second = await getMonthlyOverview(props.searchParams.currency)

	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Title order={2}>Dashboard</Title>
				{first.status === 'SUCCESS' && first.data.length > 0 && (
					<CurrencySelector currencies={first.data} />
				)}
			</Group>
			<Paper p="xl" withBorder shadow="md">
				<Title order={4}>Monthly Overview</Title>
				<Space h={24} />
				<MonthlyOverview
					data={second.data ?? []}
					hasError={second.status === 'ERROR'}
					currency={props.searchParams.currency}
				/>
			</Paper>
		</main>
	)
}
