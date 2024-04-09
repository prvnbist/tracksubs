'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import relativeTime from 'dayjs/plugin/relativeTime'

import { modals } from '@mantine/modals'
import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Center,
	Flex,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core'

import { useGlobal } from 'state/global'
import { subscriptions_list } from 'actions'
import { CreateEmptyState } from 'components'

import { Create } from './components'

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
						// handle error
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
				<SimpleGrid cols={3} component="ul" m={0} p={0}>
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
	return (
		<Card component="li" shadow="sm" padding="lg" radius="md" withBorder>
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
					<Badge radius="sm" variant="light">
						{subscription.interval}
					</Badge>
					<Text size="lg">
						{new Intl.NumberFormat('en-IN', {
							style: 'currency',
							currency: 'INR',
						}).format(subscription.amount / 100)}
					</Text>
				</Stack>
			</Group>
		</Card>
	)
}
