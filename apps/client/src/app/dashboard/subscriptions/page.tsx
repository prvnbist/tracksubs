import type { Metadata } from 'next'
import { lazy, type PropsWithChildren } from 'react'
import { Flex, Group, Space, Title } from '@mantine/core'

import { subscriptions_list } from './action'
import { CreateEmptyState, ErrorState } from 'components'

import IntervalSelector from './components/intervalSelector'
import { CreateSubscriptionButton, ExportSubscriptionsButton } from './components'

const Subscriptions = lazy(() => import('./components/subscriptions'))

export const metadata: Metadata = {
	title: 'Subscriptions | TrackSubs',
}

export default async function Page({
	params,
	searchParams,
}: { params: any; searchParams: { interval: 'ALL' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' } }) {
	const { interval = 'ALL' } = searchParams

	try {
		const data = await subscriptions_list({ interval })

		if (data?.data?.length === 0) {
			return (
				<Shell>
					<CreateEmptyState
						title="Create a subscription"
						description="You don't have any subscriptions yet, let's start by creating one!"
					/>
				</Shell>
			)
		}
		return (
			<Shell>
				<Subscriptions subscriptions={data?.data ?? []} />
			</Shell>
		)
	} catch (error) {
		return (
			<Shell>
				<ErrorState title="Something went wrong!" />
			</Shell>
		)
	}
}

const Shell = ({ children }: PropsWithChildren) => {
	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Flex gap="sm" align="center">
					<Title order={2}>Subscriptions</Title>
					<CreateSubscriptionButton />
				</Flex>
				<ExportSubscriptionsButton />
			</Group>
			<IntervalSelector />
			<Space h="sm" />
			{children}
		</main>
	)
}
