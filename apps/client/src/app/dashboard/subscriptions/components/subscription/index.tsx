'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import Image from 'next/image'
import { IconTrash } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'

import relativeTime from 'dayjs/plugin/relativeTime'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Badge, Card, Center, Group, Overlay, Stack, Text, Title } from '@mantine/core'

import { ISubscription } from 'types'
import { useGlobal } from 'state/global'
import { subscriptions_delete } from 'actions'

import classes from './index.module.css'

dayjs.extend(relativeTime)

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
					queryClient.invalidateQueries({ queryKey: ['subscriptions_analytics_weekly'] })
					queryClient.invalidateQueries({
						queryKey: ['subscriptions_analytics_top_five_most_expensive'],
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
						{subscription.is_active ? (
							<Text size="sm" c={isDueThisWeek ? 'red.4' : 'dark.2'}>
								{isDueThisWeek
									? `Due ${dayjs(subscription.next_billing_date).fromNow()}`
									: `Due: ${dayjs(subscription.next_billing_date).format('MMM DD, YYYY')}`}
							</Text>
						) : (
							<Text size="sm" c="dimmed">
								Paused
							</Text>
						)}
					</Stack>
				</Group>
				<Stack gap={2} align="flex-end">
					<Badge size="sm" radius="sm" variant="light">
						{subscription.interval}
					</Badge>
					<Text size="md" ff="monospace">
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

export default Subscription
