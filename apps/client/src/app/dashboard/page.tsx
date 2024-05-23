import { redirect } from 'next/navigation'
import { IconInfoCircle } from '@tabler/icons-react'

import { Group, Paper, SimpleGrid, Space, Stack, Text, Title, Tooltip } from '@mantine/core'

import {
	getActiveSubscriptions,
	getCurrencies,
	getMonthlyOverview,
	getThisWeekMonthSubscriptions,
	getUserMetadata,
} from 'actions'

import { CurrencySelector, MonthlyOverview } from './components'

interface IPageProps {
	params: {
		[key in string]: any
	}
	searchParams: { currency?: string }
}

export default async function Page(props: IPageProps) {
	const { currency } = await getUserMetadata()

	if (!props.searchParams.currency) return redirect(`/dashboard/?currency=${currency}`)

	const first = await getCurrencies()
	const second = await getMonthlyOverview(props.searchParams.currency)
	const third = await getActiveSubscriptions(props.searchParams.currency)
	const four = await getThisWeekMonthSubscriptions(props.searchParams.currency)

	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Title order={2}>Dashboard</Title>
				{first.status === 'SUCCESS' && first.data.length > 0 && (
					<CurrencySelector currencies={first.data} />
				)}
			</Group>
			<SimpleGrid mb={16} cols={{ base: 1, sm: 2 }}>
				<Paper p="xl" withBorder shadow="md">
					<Group gap={8}>
						<Title order={4}>Subscriptions</Title>
						<Tooltip
							multiline
							offset={8}
							position="top"
							color="dark.6"
							label={
								<Stack gap={4} p={4}>
									<Text>Active/Total</Text>
									<Text c="dimmed" size="sm">
										*Filtered by selected currency
									</Text>
								</Stack>
							}
							transitionProps={{ transition: 'fade-up', duration: 300 }}
						>
							<IconInfoCircle size={16} />
						</Tooltip>
					</Group>
					<Space h={24} />
					<Group gap={0}>
						<Text title="Active" size="48px" c="green.4" ff="monospace">
							{third.data?.active}
						</Text>
						<Text title="Total" c="dimmed" size="48px" ff="monospace">
							/{third.data?.total}
						</Text>
					</Group>
				</Paper>
				<Paper p="xl" withBorder shadow="md">
					<Group gap={8}>
						<Title order={4}>Renewal</Title>
						<Tooltip
							multiline
							offset={8}
							position="top"
							color="dark.6"
							label="*Filtered by selected currency"
							transitionProps={{ transition: 'fade-up', duration: 300 }}
						>
							<IconInfoCircle size={16} />
						</Tooltip>
					</Group>
					<Space h={24} />
					<SimpleGrid cols={2}>
						<Stack>
							<Title c="dimmed" size="13px" tt="uppercase">
								This Week
							</Title>
							<Text title="Active" size="48px" ff="monospace">
								{four.data?.this_week}
							</Text>
						</Stack>
						<Stack>
							<Title c="dimmed" size="13px" tt="uppercase">
								This Month
							</Title>
							<Text title="Active" size="48px" ff="monospace">
								{four.data?.this_month}
							</Text>
						</Stack>
					</SimpleGrid>
				</Paper>
			</SimpleGrid>
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
