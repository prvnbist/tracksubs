import dayjs from 'dayjs'
import Link from 'next/link'
import {
	IconBell,
	IconBellOff,
	IconCheck,
	IconCreditCardPay,
	IconDotsVertical,
	IconPencil,
	IconTrash,
	IconUsersPlus,
	IconX,
} from '@tabler/icons-react'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

import {
	ActionIcon,
	Avatar,
	AvatarGroup,
	Badge,
	Card,
	Group,
	Indicator,
	Menu,
	Stack,
	Text,
	Title,
	Tooltip,
	useComputedColorScheme,
} from '@mantine/core'

import { getInitials, getUserName } from 'utils'
import { useGlobal } from 'state/global'
import type { ISubscription, IService } from 'types'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

type SubscriptionProps = {
	onDelete: () => void
	onManageCollaborators: () => void
	onMarkPaid: () => void
	onSetActive: () => void
	onSetAlert: () => void
	onUpdate: () => void
	subscription: ISubscription
}

const Subscription = ({
	onDelete,
	onManageCollaborators,
	onMarkPaid,
	onSetActive,
	onSetAlert,
	onUpdate,
	subscription,
}: SubscriptionProps) => {
	const { user, services } = useGlobal()

	const scheme = useComputedColorScheme()

	const service = subscription.service ? (services[subscription.service] ?? null) : null

	const billing_date = dayjs.utc(subscription.next_billing_date).tz(user.timezone!, true)

	const dueIn = billing_date.diff(dayjs.utc(new Date()), 'week')

	const isDueThisWeek = dueIn === 0

	const isPastRenewal = dayjs.utc().isAfter(billing_date)

	const hasCollaborators = subscription.collaborators.length > 0
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
					<Group gap={8}>
						<AvatarGroup>
							{subscription.collaborators.slice(0, 3).map(collaborator => (
								<Tooltip
									key={collaborator.id}
									label={getUserName(collaborator.user)}
									withArrow
								>
									<Avatar
										size="sm"
										color="blue"
										src={collaborator.user.image_url}
										name={getUserName(collaborator.user)}
									/>
								</Tooltip>
							))}
							{subscription.collaborators.length > 3 && (
								<Avatar size="sm" color="blue">
									+{subscription.collaborators.length - 2}
								</Avatar>
							)}
						</AvatarGroup>
						<Menu shadow="md" width={240} position="bottom-end">
							<Menu.Target>
								<ActionIcon variant={scheme === 'light' ? 'default' : 'subtle'}>
									<IconDotsVertical size={18} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									onClick={onManageCollaborators}
									leftSection={<IconUsersPlus size={18} />}
									title={hasCollaborators ? 'Manage Collaborators' : 'Add Collaborators'}
								>
									{hasCollaborators ? 'Manage Collaborators' : 'Add Collaborators'}
								</Menu.Item>
								{isPastRenewal && (
									<Menu.Item
										title="Mark Paid"
										onClick={onMarkPaid}
										leftSection={<IconCreditCardPay size={18} />}
									>
										Mark Paid
									</Menu.Item>
								)}
								<Menu.Item
									onClick={onSetActive}
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
										onClick={onSetAlert}
										title={subscription.email_alert ? 'Unset Alert' : 'Set Alert'}
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
									onClick={onUpdate}
									leftSection={<IconPencil size={18} />}
								>
									Edit
								</Menu.Item>
								<Menu.Item
									color="red"
									title="Delete"
									onClick={onDelete}
									leftSection={<IconTrash size={18} />}
								>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
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
	service,
	subscription,
}: { subscription: ISubscription; service: IService | null }) => (
	<Avatar
		fw={300}
		radius="sm"
		color="blue"
		autoCapitalize="on"
		name={getInitials(subscription.title)}
		src={service ? `/services/${service.key}.svg` : null}
	/>
)
