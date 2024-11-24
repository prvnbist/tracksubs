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
	onSetAlert: (isEmailAlertOn: boolean) => void
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

	const isOwner = subscription.user_id === user.id

	const service = subscription.service ? (services[subscription.service] ?? null) : null

	const billing_date = dayjs.utc(subscription.next_billing_date).tz(user.timezone!, true)

	const dueIn = billing_date.diff(dayjs.utc(new Date()), 'week')

	const isDueThisWeek = dueIn === 0

	const isPastRenewal = dayjs.utc().isAfter(billing_date)

	const hasCollaborators = subscription.collaborators.length > 0

	const amount = isOwner
		? subscription.amount / 100
		: (subscription.collaborators?.[0]?.amount ?? 0) / 100

	const isEmailAlertOn = isOwner
		? subscription.email_alert
		: subscription.collaborators?.[0]?.email_alert

	return (
		<Card
			shadow="sm"
			padding="lg"
			radius="md"
			withBorder
			styles={{
				root: {
					...(!subscription.is_active && { filter: 'grayscale(1)' }),
					...(isPastRenewal && {
						borderWidth: 2,
						borderColor: 'var(--mantine-color-red-5)',
					}),
				},
			}}
		>
			<Card.Section p={16} withBorder bg="var(--mantine-color-dark-7)">
				<Group justify="space-between">
					<Group gap={16}>
						<Indicator
							size={12}
							withBorder
							color="green"
							disabled={!isEmailAlertOn}
							title={isEmailAlertOn ? 'Email Alert Enabled' : ''}
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
								<Text size="sm" c={isDueThisWeek ? 'red.4' : 'dark.2'}>
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
						{isOwner && (
							<AvatarGroup>
								{subscription.collaborators.slice(0, 3).map(collaborator => (
									<Tooltip
										withArrow
										key={collaborator.id}
										label={
											collaborator.user_id === user.id
												? 'You'
												: getUserName(collaborator.user)
										}
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
						)}
						<Menu shadow="md" width={240} position="bottom-end">
							<Menu.Target>
								<ActionIcon variant="subtle">
									<IconDotsVertical size={18} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								{isOwner && (
									<Menu.Item
										onClick={onManageCollaborators}
										leftSection={<IconUsersPlus size={18} />}
										title={
											hasCollaborators ? 'Manage Collaborators' : 'Add Collaborators'
										}
									>
										{hasCollaborators ? 'Manage Collaborators' : 'Add Collaborators'}
									</Menu.Item>
								)}
								{isOwner && isPastRenewal && (
									<Menu.Item
										title="Mark Paid"
										onClick={onMarkPaid}
										leftSection={<IconCreditCardPay size={18} />}
									>
										Mark Paid
									</Menu.Item>
								)}
								{isOwner && (
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
								)}
								{subscription.is_active && (
									<Menu.Item
										onClick={() => onSetAlert(!isEmailAlertOn)}
										title={isEmailAlertOn ? 'Unset Alert' : 'Set Alert'}
										leftSection={
											isEmailAlertOn ? <IconBellOff size={18} /> : <IconBell size={18} />
										}
									>
										{isEmailAlertOn ? 'Unset Alert' : 'Set Alert'}
									</Menu.Item>
								)}
								{isOwner && (
									<Menu.Item
										title="Edit"
										onClick={onUpdate}
										leftSection={<IconPencil size={18} />}
									>
										Edit
									</Menu.Item>
								)}
								{isOwner && (
									<Menu.Item
										color="red"
										title="Delete"
										onClick={onDelete}
										leftSection={<IconTrash size={18} />}
									>
										Delete
									</Menu.Item>
								)}
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Group>
			</Card.Section>
			<Card.Section p={16}>
				<Group justify="space-between">
					<Group gap={0} align="center">
						<Text size="md" ff="monospace">
							{new Intl.NumberFormat('en-IN', {
								style: 'currency',
								currency: subscription.currency,
							}).format(amount)}
						</Text>
						{!isOwner && (
							<Text size="md" c="dimmed" ff="monospace">
								(
								{new Intl.NumberFormat('en-IN', {
									style: 'currency',
									currency: subscription.currency,
								}).format(subscription.amount / 100)}
								)
							</Text>
						)}
					</Group>
					<Group gap={8}>
						{!isOwner && (
							<Badge variant="light" c="blue">
								Split
							</Badge>
						)}
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
