'use client'

import dayjs from 'dayjs'
import Link from 'next/link'
import { lazy } from 'react'
import Image from 'next/image'
import { useAction } from 'next-safe-action/hooks'
import {
	IconBell,
	IconBellOff,
	IconCheck,
	IconCreditCardPay,
	IconDotsVertical,
	IconPencil,
	IconTrash,
	IconX,
} from '@tabler/icons-react'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
	ActionIcon,
	Avatar,
	Badge,
	Card,
	Group,
	Indicator,
	Menu,
	Stack,
	Text,
	Title,
	useComputedColorScheme,
} from '@mantine/core'

import { getInitials, track } from 'utils'
import type { ISubscription, IService } from 'types'
import { PLANS } from 'consts'
import { useGlobal } from 'state/global'
import { subscription_alert, subscriptions_active, subscriptions_delete } from '../../action'

const UpdateModal = lazy(() => import('../updateModal'))
const CreateTransactionModal = lazy(() => import('./component/createTransactionModal'))

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

type SubscriptionProps = {
	subscription: ISubscription
}

const Subscription = ({ subscription }: SubscriptionProps) => {
	const { user, services } = useGlobal()

	const usage = user.usage!

	const scheme = useComputedColorScheme()

	const service = subscription.service ? (services[subscription.service] ?? null) : null

	const billing_date = dayjs.utc(subscription.next_billing_date).tz(user.timezone!, true)

	const dueIn = billing_date.diff(dayjs.utc(new Date()), 'week')

	const isDueThisWeek = dueIn === 0

	const isPastRenewal = dayjs.utc().isAfter(billing_date)

	const plan = PLANS[user.plan]!

	const { execute: setActive } = useAction(subscriptions_active, {
		onSuccess: ({ data }) => {
			const result = (data as Array<{ is_active: boolean; title: string }>)?.[0]!

			track(result.is_active ? 'btn-set-active' : 'btn-set-inactive')

			notifications.show({
				color: 'green',
				title: 'Success',
				message: result.is_active
					? `Enabled the subscription: ${result.title}`
					: `Disabled the subscription: ${result.title}`,
			})
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to update the subscription',
			})
		},
	})

	const { execute: setAlert } = useAction(subscription_alert, {
		onSuccess: ({ data }) => {
			const result = (data as Array<{ email_alert: boolean; title: string }>)?.[0]!

			track(subscription.email_alert ? 'btn-set-alert' : 'btn-unset-alert')

			notifications.show({
				color: 'green',
				title: 'Success',
				message: result.email_alert
					? `You will now recieve alerts for: ${result.title}`
					: `Disabled the email alerts for: ${result.title}`,
			})
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to update the subscription',
			})
		},
	})

	const { execute: deleteSubscriptionAction } = useAction(subscriptions_delete, {
		onSuccess: () => {
			track('btn-delete-subscription')
			notifications.show({
				color: 'green',
				message: `Successfully deleted the subscription - ${subscription.title}`,
			})
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to delete the subscription',
			})
		},
	})

	const deleteSubscription = () =>
		modals.openConfirmModal({
			title: 'Delete Subscription',
			children: <Text size="sm">Are you sure you want to delete this subscription?</Text>,
			labels: { confirm: 'Yes, Delete', cancel: 'Cancel' },
			onConfirm: () => deleteSubscriptionAction({ id: subscription.id }),
		})

	const markPaid = () =>
		modals.open({
			title: 'Create Transaction',
			children: <CreateTransactionModal subscription={subscription} />,
		})

	const toggleAlert = () => {
		if (!subscription.email_alert && usage.total_alerts === plan.alerts) {
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
			onConfirm: () =>
				setAlert({
					id: subscription.id,
					email_alert: !subscription.email_alert,
				}),
		})
	}

	const toggleActive = () => {
		modals.openConfirmModal({
			title: subscription.is_active ? 'Mark Inactive' : 'Mark Active',
			children: (
				<Text size="sm">
					{subscription.is_active
						? 'Please confirm if you want to disable '
						: 'Please confirm if you want to enable '}
					the subscription: {subscription.title}
				</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () =>
				setActive({
					id: subscription.id,
					is_active: !subscription.is_active,
				}),
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
					...(!subscription.is_active && { filter: 'grayscale(1)' }),
					...(isPastRenewal && { borderWidth: 2, borderColor: 'var(--mantine-color-red-5)' }),
				},
			}}
		>
			<Card.Section
				p={16}
				withBorder
				bg={scheme === 'light' ? 'transparent' : 'var(--mantine-color-dark-7)'}
			>
				<Group justify="space-between">
					<Group gap={16}>
						<Indicator
							size={12}
							withBorder
							color="green"
							disabled={!subscription.email_alert}
						>
							{subscription.website ? (
								<Link
									target="_blank"
									href={subscription.website}
									style={{ display: 'flex', textDecoration: 'none' }}
								>
									<SubscriptionAvatar subscription={subscription} service={service} />
								</Link>
							) : (
								<SubscriptionAvatar subscription={subscription} service={service} />
							)}
						</Indicator>
						<Stack gap={0}>
							<Title order={5}>{subscription.title}</Title>
							{subscription.is_active ? (
								<Text
									size="sm"
									c={isDueThisWeek ? (scheme === 'light' ? 'red.7' : 'red.4') : 'dark.2'}
								>
									{isDueThisWeek
										? `Due ${billing_date.fromNow()}`
										: `Due: ${billing_date.format('MMM DD, YYYY')}`}
								</Text>
							) : (
								<Text size="sm" c="dimmed">
									Inactive
								</Text>
							)}
						</Stack>
					</Group>
					<Menu shadow="md" width={160} position="bottom-end">
						<Menu.Target>
							<ActionIcon variant={scheme === 'light' ? 'default' : 'subtle'}>
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
								onClick={toggleActive}
								leftSection={
									subscription.is_active ? (
										<IconCheck size={18} color="var(--mantine-color-green-5)" />
									) : (
										<IconX size={18} color="var(--mantine-color-gray-5)" />
									)
								}
								title={`Mark ${subscription.is_active ? 'Inactive' : 'Active'}`}
							>
								Mark {subscription.is_active ? 'Inactive' : 'Active'}
							</Menu.Item>
							{subscription.is_active && (
								<Menu.Item
									title={subscription.email_alert ? 'Unset Alert' : 'Set Alert'}
									onClick={toggleAlert}
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
							)}
							<Menu.Item
								title="Edit"
								onClick={() =>
									modals.open({
										title: 'Edit Subscription',
										children: <UpdateModal subscription={subscription} />,
									})
								}
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
						variant={scheme === 'light' ? 'default' : 'light'}
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

const SubscriptionAvatar = ({
	subscription,
	service,
}: { subscription: ISubscription; service: IService | null }) => {
	const scheme = useComputedColorScheme()

	if (!service) {
		return (
			<Avatar color="blue" radius="sm" fw={300}>
				{getInitials(subscription.title)}
			</Avatar>
		)
	}
	return (
		<Image
			width={40}
			height={40}
			alt={subscription.title}
			src={`/services/${service.key}.svg`}
			style={{
				borderRadius: scheme === 'light' ? '4px' : 0,
				border: scheme === 'light' ? '1px solid var(--mantine-color-gray-2)' : 'none',
			}}
		/>
	)
}
