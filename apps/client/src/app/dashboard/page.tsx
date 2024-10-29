import { Suspense } from 'react'
import { asc, eq } from 'drizzle-orm'
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

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'actions'

import {
	ActiveSubscriptions,
	CurrencySelector,
	MonthlyOverview,
	RenewingSubscriptions,
} from './components'

interface IPageProps {
	searchParams: { currency?: string }
}

const FallbackLoader = () => (
	<Center h="100%">
		<Loader />
	</Center>
)

export default async function Page(props: IPageProps) {
	const { user_id, currency } = await getUserMetadata()

	const selectedCurrency = props.searchParams.currency ?? currency

	const currencies = await db
		.selectDistinct({ currency: schema.subscription.currency })
		.from(schema.subscription)
		.where(eq(schema.subscription.user_id, user_id))
		.orderBy(asc(schema.subscription.currency))

	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Title order={2}>Dashboard</Title>
				<CurrencySelector data={currencies} currency={selectedCurrency} />
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
					<Suspense fallback={<FallbackLoader />}>
						<ActiveSubscriptions user_id={user_id} currency={selectedCurrency} />
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
					<Suspense fallback={<FallbackLoader />}>
						<RenewingSubscriptions user_id={user_id} currency={selectedCurrency} />
					</Suspense>
				</Paper>
			</SimpleGrid>
			<Paper p="xl" withBorder shadow="md">
				<Title order={4}>Monthly Overview</Title>
				<Space h={24} />
				<Suspense fallback={<FallbackLoader />}>
					<MonthlyOverview user_id={user_id} currency={selectedCurrency} />
				</Suspense>
			</Paper>
		</main>
	)
}
