'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { Button, Card, Group, SegmentedControl, SimpleGrid, Skeleton } from '@mantine/core'

import { useGlobal } from 'state/global'
import { CYCLES } from 'constants/index'
import { subscriptions_list } from 'actions'
import { CreateEmptyState, ErrorState } from 'components'

import CreateModal from './createModal'
import Subscription from './subscription'

const Subscriptions = () => {
	const { user } = useGlobal()
	const router = useRouter()

	const [interval, setInterval] = useState('ALL')

	const { status, data, error } = useQuery({
		retry: 0,
		enabled: !!user.id,
		refetchOnWindowFocus: false,
		queryKey: ['subscriptions', user.id, interval],
		queryFn: () => subscriptions_list(user.id!, interval),
	})

	useEffect(() => {
		if (status === 'error' && error) {
			notifications.show({
				color: 'red',
				title: 'Failed',
				message: error.message,
			})
		}
	}, [status, error])

	const create = () => {
		modals.open({
			title: 'Create Subscription',
			children: <CreateModal />,
		})
	}

	return (
		<>
			<Group mb={16}>
				<SegmentedControl
					size="sm"
					radius="sm"
					value={interval}
					onChange={setInterval}
					withItemsBorders={false}
					data={[{ value: 'ALL', label: 'All' }, ...CYCLES]}
				/>
			</Group>
			{status === 'pending' && <LoadingSkeleton />}
			{status === 'error' && (
				<ErrorState title="Something went wrong!">
					<Button title="Refresh Page" onClick={() => router.refresh()}>
						Refresh Page
					</Button>
				</ErrorState>
			)}
			{status === 'success' && Array.isArray(data) && (
				<>
					{data.length ? (
						<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
							{data.map(subscription => (
								<Subscription key={subscription.id} subscription={subscription} />
							))}
						</SimpleGrid>
					) : (
						<CreateEmptyState
							title="Create a subscription"
							description="You don't have any subscriptions yet, let's start by creating one!"
						>
							<Button title="Create Subscription" onClick={create}>
								Create Subscription
							</Button>
						</CreateEmptyState>
					)}
				</>
			)}
		</>
	)
}

export default Subscriptions

const LoadingSkeleton = () => {
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
			<Card h={88} shadow="sm" padding="lg" radius="md" withBorder>
				<Skeleton height={62} w="70%" circle />
				<Skeleton height={62} w="30%" circle my={8} />
				<Skeleton height={62} w="50%" circle />
			</Card>
			<Card h={88} shadow="sm" padding="lg" radius="md" withBorder>
				<Skeleton height={62} w="40%" circle />
				<Skeleton height={62} w="70%" circle my={8} />
				<Skeleton height={62} w="30%" circle />
			</Card>
			<Card h={88} shadow="sm" padding="lg" radius="md" withBorder>
				<Skeleton height={62} w="90%" circle />
				<Skeleton height={62} w="60%" circle my={8} />
				<Skeleton height={62} w="40%" circle />
			</Card>
			<Card h={88} shadow="sm" padding="lg" radius="md" withBorder>
				<Skeleton height={62} w="50%" circle />
				<Skeleton height={62} w="80%" circle my={8} />
				<Skeleton height={62} w="40%" circle />
			</Card>
			<Card h={88} shadow="sm" padding="lg" radius="md" withBorder>
				<Skeleton height={62} w="70%" circle />
				<Skeleton height={62} w="40%" circle my={8} />
				<Skeleton height={62} w="60%" circle />
			</Card>
		</SimpleGrid>
	)
}
