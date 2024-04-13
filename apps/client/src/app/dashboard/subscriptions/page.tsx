'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconTrash } from '@tabler/icons-react'

import relativeTime from 'dayjs/plugin/relativeTime'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Center,
	Flex,
	Group,
	Loader,
	Overlay,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core'

import { ISubscription } from 'types'
import { useGlobal } from 'state/global'
import { CreateEmptyState, ErrorState } from 'components'
import { subscriptions_delete, subscriptions_list } from 'actions'

import { Create } from './components'
import classes from './page.module.css'

dayjs.extend(relativeTime)

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

const Subscription = ({ subscription }: { subscription: ISubscription }) => {
	const { services } = useGlobal()
	const queryClient = useQueryClient()

	const service = subscription.service ? services[subscription.service] : null

	const dueIn = dayjs(subscription.next_billing_date).diff(dayjs(new Date()), 'week')
	const isDueThisWeek = dueIn === 0

	const deleteSubscription = () =>
		modals.openConfirmModal({
			title: 'Delete Subscription',
			children: <Text size="sm">Are you sure you want to delete this subscription?</Text>,
			labels: { confirm: 'Yes, Delete', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					const result = await subscriptions_delete(subscription.id)

					if (result.status === 'ERROR') {
						throw Error()
					}

					notifications.show({
						color: 'green',
						message: `Successfully deleted the subscription - ${subscription.title}`,
					})

					queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Failed',
						message: `Failed to delete the subscription - ${subscription.title}`,
					})
				}
			},
		})

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card__subscription}>
			<Group justify="space-between">
				<Group gap={16}>
					{service && (
						<Link href={subscription.website}>
							<Image
								width={40}
								height={40}
								alt={subscription.title}
								src={`/services/${service.key}.svg`}
							/>
						</Link>
					)}
					<Stack gap={0}>
						<Title order={4}>{subscription.title}</Title>
						<Text size="sm" c={isDueThisWeek ? 'red.4' : 'dark.2'}>
							{isDueThisWeek
								? `Due ${dayjs(subscription.next_billing_date).fromNow()}`
								: `Due: ${dayjs(subscription.next_billing_date).format('MMM DD, YYYY')}`}
						</Text>
					</Stack>
				</Group>
				<Stack gap={2} align="flex-end">
					<Badge size="sm" radius="sm" variant="light">
						{subscription.interval}
					</Badge>
					<Text size="lg">
						{new Intl.NumberFormat('en-IN', {
							style: 'currency',
							currency: subscription.currency,
						}).format(subscription.amount / 100)}
					</Text>
				</Stack>
			</Group>
			<Overlay
				blur={3}
				color="#000"
				backgroundOpacity={0.5}
				className={classes.subscription__card__overlay}
			>
				<Center h="100%">
					<ActionIcon
						color="red.4"
						variant="light"
						title="Delete Subscription"
						onClick={deleteSubscription}
					>
						<IconTrash size={18} />
					</ActionIcon>
				</Center>
			</Overlay>
		</Card>
	)
}
