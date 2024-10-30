import { Suspense } from 'react'
import { asc, eq } from 'drizzle-orm'

import { Center, Group, Loader, Paper, SimpleGrid, Space, Title } from '@mantine/core'

import db, { schema } from '@tracksubs/drizzle'

import { getUserMetadata } from 'utils'
import { CreateEmptyState } from 'components'

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

	if (!user_id || !currency)
		return (
			<main>
				<Group component="header" mt="md" mb="md" justify="space-between">
					<Title order={2}>Dashboard</Title>
				</Group>
				<CreateEmptyState
					title="No data"
					description="Analytics will populate once you create a subscriptions."
				/>
			</main>
		)

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
					<Title order={4}>Subscriptions</Title>
					<Space h={24} />
					<Suspense fallback={<FallbackLoader />}>
						<ActiveSubscriptions user_id={user_id} currency={selectedCurrency} />
					</Suspense>
				</Paper>
				<Paper p="xl" withBorder shadow="md">
					<Title order={4}>Renewal</Title>
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
