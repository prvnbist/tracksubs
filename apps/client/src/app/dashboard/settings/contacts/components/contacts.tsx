'use client'

import dayjs from 'dayjs'
import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { IconCheck, IconTrash } from '@tabler/icons-react'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Badge, Box, Group, Table, Tabs, Text } from '@mantine/core'

import type { IContact } from 'types'
import { useGlobal } from 'state/global'
import { CreateEmptyState } from 'components'

import { accept, reject, remove, undo } from '../action'

const showNotification = (keyword: string, isSuccess = true) =>
	notifications.show({
		color: isSuccess ? 'green' : 'red',
		title: isSuccess ? 'Success' : 'Error',
		message: `${isSuccess ? 'Successfully' : 'Failed to'} ${keyword} the contact.`,
	})

type ConfirmProps = {
	title: string
	description: string
	confirmLabel: string
	callback: () => void
}

const confirm = ({ title, description, confirmLabel, callback }: ConfirmProps) =>
	modals.openConfirmModal({
		title: title,
		onConfirm: callback,
		children: <Text size="sm">{description}</Text>,
		labels: { confirm: confirmLabel, cancel: 'Cancel' },
	})

const CONFIRM_COPY = {
	REMOVE: {
		title: 'Remove Contact',
		confirmLabel: 'Yes, Remove',
		description: 'Are you sure you want to remove this contact? This action cannot be undone.',
	},
	UNDO: {
		title: 'Remove Request',
		confirmLabel: 'Yes, Remove',
		description:
			'Are you sure you want to remove this contact request? This action cannot be undone.',
	},
	ACCEPT: {
		title: 'Accept Request',
		confirmLabel: 'Yes, Accept',
		description: 'Are you sure you want to accept this contact request?',
	},
	REJECT: {
		title: 'Reject Request',
		confirmLabel: 'Yes, Reject',
		description:
			'Are you sure you want to reject this contact request? This action cannot be undone.',
	},
}

const Contacts = () => {
	const { user, contacts } = useGlobal()

	const [added, sent, received] = useMemo(() => {
		const _contacts = [...contacts.values()]
		const added = _contacts.filter(contact => contact.status === 'ACCEPTED')
		const sent = _contacts.filter(
			contact => contact.sender_id === user.id && contact.status === 'PENDING'
		)
		const received = _contacts.filter(
			contact => contact.receiver_id === user.id && contact.status === 'PENDING'
		)
		return [added, sent, received]
	}, [user.id, contacts])

	const { execute: onRemove } = useAction(remove, {
		onError: () => showNotification('remove'),
		onSuccess: ({ data }) => data && showNotification('removed', true),
	})

	const { execute: onUndo } = useAction(undo, {
		onError: () => showNotification('remove'),
		onSuccess: ({ data }) => data && showNotification('removed', true),
	})

	const { execute: onAccept } = useAction(accept, {
		onError: () => showNotification('accept'),
		onSuccess: ({ data }) => data && showNotification('accepted', true),
	})

	const { execute: onReject } = useAction(reject, {
		onError: () => showNotification('reject'),
		onSuccess: ({ data }) => data && showNotification('rejected', true),
	})

	return (
		<Tabs defaultValue="default">
			<Tabs.List>
				<Tab value="default" label="Contacts" count={added.length} />
				<Tab value="sent" label="Sent" count={sent.length} />
				<Tab value="received" label="Received" count={received.length} />
			</Tabs.List>
			<Panel
				list={added}
				variant="default"
				columns={['Name', 'Email']}
				onRemove={id =>
					confirm({
						callback: () => onRemove({ id }),
						title: CONFIRM_COPY.REMOVE.title,
						description: CONFIRM_COPY.REMOVE.description,
						confirmLabel: CONFIRM_COPY.REMOVE.confirmLabel,
					})
				}
			/>
			<Panel
				list={sent}
				variant="sent"
				onUndo={id =>
					confirm({
						title: CONFIRM_COPY.UNDO.title,
						callback: () => onUndo({ id }),
						description: CONFIRM_COPY.UNDO.description,
						confirmLabel: CONFIRM_COPY.UNDO.confirmLabel,
					})
				}
				columns={['Name', 'Email', 'Sent On', 'Status']}
			/>
			<Panel
				onAccept={id =>
					confirm({
						title: CONFIRM_COPY.ACCEPT.title,
						callback: () => onAccept({ id }),
						description: CONFIRM_COPY.ACCEPT.description,
						confirmLabel: CONFIRM_COPY.ACCEPT.confirmLabel,
					})
				}
				onReject={id =>
					confirm({
						title: CONFIRM_COPY.REJECT.title,
						callback: () => onReject({ id }),
						description: CONFIRM_COPY.REJECT.description,
						confirmLabel: CONFIRM_COPY.REJECT.confirmLabel,
					})
				}
				columns={['Name', 'Email', 'Received On']}
				list={received}
				variant="received"
			/>
		</Tabs>
	)
}

export default Contacts

const Tab = ({ value, label, count }: { value: string; label: string; count: number }) => {
	return (
		<Tabs.Tab value={value} disabled={count === 0}>
			<Group gap="xs">
				<Text size="sm">{label}</Text>
				<Badge size="sm" variant="light">
					{count}
				</Badge>
			</Group>
		</Tabs.Tab>
	)
}

type PanelProps = {
	columns: Array<string>
	list: Array<IContact>
	variant: 'default' | 'sent' | 'received'

	onAccept?: (id: string) => void
	onReject?: (id: string) => void
	onRemove?: (id: string) => void
	onUndo?: (id: string) => void
}

const Panel = ({ columns, list, variant, onAccept, onReject, onRemove, onUndo }: PanelProps) => {
	const { user } = useGlobal()

	if (list.length === 0)
		return (
			<Tabs.Panel value={variant} py="sm">
				<Box>
					<CreateEmptyState
						title="No contacts yet"
						description="You will see your contacts once you add someone or accept a request you have received."
					/>
				</Box>
			</Tabs.Panel>
		)
	return (
		<Tabs.Panel value={variant} py="sm">
			<Table striped withTableBorder withColumnBorders>
				<Table.Thead>
					<Table.Tr>
						{columns.map(column => (
							<Table.Th key={column}>{column}</Table.Th>
						))}
						<Table.Th ta="center">Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{list.map(contact => (
						<Contact
							key={contact.id}
							contact={contact}
							variant={variant}
							isSender={user.id === contact.sender_id}
						>
							{variant === 'default' && (
								<ActionIcon
									size="sm"
									variant="subtle"
									color="red.6"
									title="Remove"
									onClick={() => onRemove?.(contact.id)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							)}

							{variant === 'sent' && (
								<ActionIcon
									size="sm"
									variant="subtle"
									color="red.6"
									title="Undo"
									onClick={() => onUndo?.(contact.id)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							)}

							{variant === 'received' && (
								<Group gap={8} justify="center">
									<ActionIcon
										size="sm"
										variant="subtle"
										color="green.6"
										title="Accept"
										onClick={() => onAccept?.(contact.id)}
									>
										<IconCheck size={16} />
									</ActionIcon>
									<ActionIcon
										size="sm"
										variant="subtle"
										color="red.6"
										title="Reject"
										onClick={() => onReject?.(contact.id)}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Group>
							)}
						</Contact>
					))}
				</Table.Tbody>
			</Table>
		</Tabs.Panel>
	)
}

interface ContactProps extends PropsWithChildren {
	contact: IContact
	isSender: boolean
	variant?: 'default' | 'sent' | 'received'
}

const Contact = ({ contact, variant = 'default', isSender = false, children }: ContactProps) => {
	const _isSender = isSender || variant === 'sent'
	const person =
		variant === 'default'
			? contact[_isSender ? 'receiver' : 'sender']
			: variant === 'sent'
				? contact.receiver
				: contact.sender

	const fullName = `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim()

	return (
		<Table.Tr>
			<Table.Td>{fullName}</Table.Td>
			<Table.Td>{person.email}</Table.Td>
			{(variant === 'sent' || variant === 'received') && (
				<Table.Td>{dayjs(contact.sent_at).format('MMM DD, YYYY')}</Table.Td>
			)}
			{variant === 'sent' && <Table.Td>{contact.status}</Table.Td>}
			<Table.Td ta="center">{children}</Table.Td>
		</Table.Tr>
	)
}
