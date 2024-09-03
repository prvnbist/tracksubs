import { Suspense } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import {
	Center,
	Group,
	Loader,
	Paper,
	SimpleGrid,
	Space,
	Stack,
	Text,
	Title,
	Tooltip,
} from '@mantine/core'

import { getUserMetadata } from 'actions'

import {
	ActiveSubscriptions,
	CurrencySelector,
	MonthlyOverview,
	RenewingSubscriptions,
} from './components'
import {
	getActiveSubscriptions,
	getCurrencies,
	getMonthlyOverview,
	getThisWeekMonthSubscriptions,
} from './action'

interface IPageProps {
	searchParams: { currency?: string }
}

export default async function Page(props: IPageProps) {
	const { currency } = await getUserMetadata()

	const selectedCurrency = props.searchParams.currency ?? currency

	const first = getCurrencies()
	const second = getMonthlyOverview(selectedCurrency)
	const third = getActiveSubscriptions(selectedCurrency)
	const four = getThisWeekMonthSubscriptions(selectedCurrency)

	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Title order={2}>Dashboard</Title>
				<CurrencySelector data={first} selected={selectedCurrency} />
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
					<Suspense
						fallback={
							<Center h="100%">
								<Loader />
							</Center>
						}
					>
						<ActiveSubscriptions data={third} />
					</Suspense>
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
					<Suspense
						fallback={
							<Center h="100%">
								<Loader />
							</Center>
						}
					>
						<RenewingSubscriptions data={four} />
					</Suspense>
				</Paper>
			</SimpleGrid>
			<Paper p="xl" withBorder shadow="md">
				<Title order={4}>Monthly Overview</Title>
				<Space h={24} />
				<Suspense
					fallback={
						<Center h="100%">
							<Loader />
						</Center>
					}
				>
					<MonthlyOverview data={second} currency={selectedCurrency} />
				</Suspense>
			</Paper>
		</main>
	)
}
