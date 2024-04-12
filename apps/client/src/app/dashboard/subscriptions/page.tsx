'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
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

import { useGlobal } from 'state/global'
import { CreateEmptyState } from 'components'
import { subscriptions_delete, subscriptions_list } from 'actions'

import { Create } from './components'
import classes from './page.module.css'

export interface ISubscription {
	id: string
	title: string
	website: string
	amount: number
	currency: string
	interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
	user_id: string
	next_billing_date: string | null
	payment_method_id: string
	service: null | string
}

dayjs.extend(relativeTime)

export default function Page(): JSX.Element {
	const { user } = useGlobal()

	const [status, setStatus] = useState('LOADING')

	const [subscriptions, setSubscriptions] = useState<ISubscription[]>([])

	useEffect(() => {
		if (user.id) {
			;(async () => {
				try {
					setStatus('LOADING')
					const result = await subscriptions_list(user.id!)

					if (result.status === 'ERROR') {
						throw Error()
					}

					if (result.data.length === 0) {
						setSubscriptions([])
						setStatus('EMPTY')
						return
					}

					setSubscriptions(result.data)
					setStatus('SUCCESS')
				} catch (error) {
					setStatus('ERROR')
					notifications.show({
						color: 'red',
						title: 'Failed',
						message: `Failed to fetch the subscriptions`,
					})
				}
			})()
		}
	}, [user])

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
				{status !== 'EMPTY' && (
					<ActionIcon onClick={create} title="Create Subscription">
						<IconPlus size={18} />
					</ActionIcon>
				)}
			</Flex>
			{status === 'LOADING' && (
				<Center>
					<Loader />
				</Center>
			)}
			{status === 'EMPTY' && (
				<CreateEmptyState
					title="Create a subscription"
					description="You don't have any subscriptions yet, let's start by creating one!"
				>
					<Button title="Create Subscription" onClick={create}>
						Create Subscription
					</Button>
				</CreateEmptyState>
			)}
			{status === 'SUCCESS' && (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
					{subscriptions.map(subscription => (
						<Subscription key={subscription.id} subscription={subscription} />
					))}
				</SimpleGrid>
			)}
		</main>
	)
}

const Subscription = ({ subscription }: { subscription: ISubscription }) => {
	const { services } = useGlobal()

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
