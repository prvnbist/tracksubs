'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { IconPlus } from '@tabler/icons-react'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Button, Center, Flex, Loader, SimpleGrid, Title } from '@mantine/core'

import { useGlobal } from 'state/global'
import { subscriptions_list } from 'actions'
import { CreateEmptyState, ErrorState } from 'components'

import { Create, Subscription } from './components'

export default function Page(): JSX.Element {
	const { user } = useGlobal()
	const router = useRouter()

	const { status, data, error } = useQuery({
		retry: 0,
		enabled: !!user.id,
		refetchOnWindowFocus: false,
		queryKey: ['subscriptions', user.id],
		queryFn: () => subscriptions_list(user.id!),
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
			children: <Create />,
		})
	}

	return (
		<main>
			<Flex component="header" mt="md" mb="md" gap="sm" align="center">
				<Title order={2}>Subscriptions</Title>
				<ActionIcon
					onClick={create}
					title="Create Subscription"
					loading={status === 'pending'}
					disabled={status === 'pending'}
				>
					<IconPlus size={18} />
				</ActionIcon>
			</Flex>
			{status === 'pending' && (
				<Center>
					<Loader />
				</Center>
			)}
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
		</main>
	)
}
