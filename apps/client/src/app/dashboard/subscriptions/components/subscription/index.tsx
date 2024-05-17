'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import { lazy } from 'react'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'
import {
	IconBell,
	IconBellOff,
	IconCreditCardPay,
	IconDotsVertical,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Badge, Card, Group, Indicator, Menu, Stack, Text, Title } from '@mantine/core'

import { ISubscription } from 'types'
import { PLANS } from 'constants/index'
import { useGlobal } from 'state/global'
import { subscription_alert, subscriptions_delete } from 'actions'

const CreateTransactionModal = lazy(() => import('./component/createTransactionModal'))

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

type SubscriptionProps = {
	subscription: ISubscription
	onEdit: (subscription: ISubscription) => void
}

const Subscription = ({ subscription, onEdit }: SubscriptionProps) => {
	const { user, services } = useGlobal()
	const queryClient = useQueryClient()

	const service = subscription.service ? services[subscription.service] : null

	const billing_date = dayjs.utc(subscription.next_billing_date).tz(user.timezone!, true)

	const dueIn = billing_date.diff(dayjs.utc(new Date()), 'week')

	const isDueThisWeek = dueIn === 0

	const isPastRenewal = dayjs.utc().isAfter(billing_date)

	const plan = PLANS[user.plan]!

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

					queryClient.invalidateQueries({ queryKey: ['user'] })
					queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
					queryClient.invalidateQueries({ queryKey: ['transactions'] })
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Failed',
						message: `Failed to delete the subscription - ${subscription.title}`,
					})
				}
			},
		})

	const markPaid = () => {
		modals.open({
			title: 'Create Transaction',
			children: <CreateTransactionModal subscription={subscription} />,
		})
	}

	const setAlert = () => {
		if (!subscription.email_alert && user.total_alerts === plan.alerts) {
			return notifications.show({
				color: 'red.5',
				title: 'Usage Alert',
				message: `Selected plan allows upto ${plan.alerts} alerts. Please change your plan to the one that fits your needs.`,
			})
		}

		modals.openConfirmModal({
			title: 'Email Alert',
			children: (
				<Text size="sm">
					{subscription.email_alert
						? 'Please confirm if you want disable '
						: 'Please confirm if you want to recieve '}
					email alerts for the subscription: {subscription.title}
				</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					const result = await subscription_alert(subscription.id, !subscription.email_alert)

					if (result.status === 'ERROR') {
						return notifications.show({
							color: 'red',
							title: 'Error',
							message: result.message,
						})
					}

					queryClient.invalidateQueries({ queryKey: ['user'] })
					queryClient.invalidateQueries({ queryKey: ['subscriptions'] })

					notifications.show({
						color: 'green',
						title: 'Success',
						message: subscription.email_alert
							? `Disabled the email alerts for: ${subscription.title}`
							: `You will now recieve alerts for: ${subscription.title}`,
					})
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Error',
						message: 'Something went wrong, please try again!',
					})
				}
			},
		})
	}

	return (
		<Card
			shadow="sm"
			padding="lg"
			radius="md"
			withBorder
			styles={{
				root: {
					...(isPastRenewal && { borderWidth: 2, borderColor: 'var(--mantine-color-red-5)' }),
				},
			}}
		>
			<Card.Section p={16} bg="var(--mantine-color-dark-7)">
				<Group justify="space-between">
					<Group gap={16}>
						{service && (
							<Indicator
								size={12}
								withBorder
								color="green"
								disabled={!subscription.email_alert}
							>
								<Link href={subscription.website} style={{ display: 'flex' }}>
									<Image
										width={40}
										height={40}
										alt={subscription.title}
										src={`/services/${service.key}.svg`}
									/>
								</Link>
							</Indicator>
						)}
						<Stack gap={0}>
							<Title order={5}>{subscription.title}</Title>
							{subscription.is_active ? (
								<Text size="sm" c={isDueThisWeek ? 'red.4' : 'dark.2'}>
									{isDueThisWeek
										? `Due ${billing_date.fromNow()}`
										: `Due: ${billing_date.format('MMM DD, YYYY')}`}
								</Text>
							) : (
								<Text size="sm" c="dimmed">
									Paused
								</Text>
							)}
						</Stack>
					</Group>
					<Menu shadow="md" width={160} position="bottom-end">
						<Menu.Target>
							<ActionIcon variant="subtle">
								<IconDotsVertical size={18} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							{isPastRenewal && (
								<Menu.Item
									title="Mark Paid"
									onClick={markPaid}
									leftSection={<IconCreditCardPay size={18} />}
								>
									Mark Paid
								</Menu.Item>
							)}
							<Menu.Item
								title={subscription.email_alert ? 'Unset Alert' : 'Set Alert'}
								onClick={setAlert}
								leftSection={
									subscription.email_alert ? (
										<IconBellOff size={18} />
									) : (
										<IconBell size={18} />
									)
								}
							>
								{subscription.email_alert ? 'Unset Alert' : 'Set Alert'}
							</Menu.Item>
							<Menu.Item
								title="Edit"
								onClick={() => onEdit(subscription)}
								leftSection={<IconPencil size={18} />}
							>
								Edit
							</Menu.Item>
							<Menu.Item
								color="red"
								title="Delete"
								onClick={deleteSubscription}
								leftSection={<IconTrash size={18} />}
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Card.Section>
			<Card.Section p={16}>
				<Group justify="space-between">
					<Text size="xl" ff="monospace">
						{new Intl.NumberFormat('en-IN', {
							style: 'currency',
							currency: subscription.currency,
						}).format(subscription.amount / 100)}
					</Text>
					<Badge
						variant="light"
						c={
							subscription.interval === 'MONTHLY'
								? 'teal'
								: subscription.interval === 'QUARTERLY'
									? 'yellow'
									: 'red'
						}
					>
						{subscription.interval}
					</Badge>
				</Group>
			</Card.Section>
		</Card>
	)
}

export default Subscription
