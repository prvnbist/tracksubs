import { useMemo } from 'react'
import { IconCheck, IconUser } from '@tabler/icons-react'

import { notifications } from '@mantine/notifications'
import type { UseListStateHandlers } from '@mantine/hooks'
import type { ComboboxLikeRenderOptionInput } from '@mantine/core'
import { Select, Space, PillGroup, Pill, Group, Avatar, Text } from '@mantine/core'

import { getUserName } from 'utils'
import { useGlobal } from 'state/global'
import type { IMinimalUser, ISubscription } from 'types'

import { calculateShare } from './utils'
import type { ISelectedCollaborator } from '.'
import type { CustomComboboxItem } from '../../types'

export const renderOption = ({
	option,
	checked,
}: ComboboxLikeRenderOptionInput<CustomComboboxItem>) => (
	<Group flex="1" gap="xs" justify="space-between">
		<Group gap={8}>
			{checked && <IconCheck size={16} color="var(--mantine-color-green-4)" />}
			<Group gap={8}>
				{option.user && (
					<Avatar size="sm" src={option.user.image_url} name={getUserName(option.user)} />
				)}
				<Text size="sm">{option.label}</Text>
			</Group>
		</Group>
		{option.disabled && (
			<Text size="sm" c="dimmed" ff="monospace">
				Pending
			</Text>
		)}
	</Group>
)

type ContributorsProps = {
	subscription: ISubscription
	collaborators: Array<ISelectedCollaborator>
	handlers: UseListStateHandlers<ISelectedCollaborator>
	contacts: Map<string, { status: string; user: IMinimalUser }>
}

const Step1 = ({ contacts, collaborators, handlers, subscription }: ContributorsProps) => {
	const { user } = useGlobal()

	const options = useMemo(() => {
		const _options = []

		for (const [user_id, value] of contacts) {
			if (collaborators.findIndex(s => s.user_id === user_id) === -1) {
				_options.push({
					disabled: value.status !== 'ACCEPTED',
					label: getUserName(value.user),
					user: value.user,
					value: user_id,
				})
			}
		}

		return _options
	}, [contacts, collaborators])

	const onSelect = (value: string | null) => {
		const isPercentage = subscription.split_strategy === 'PERCENTAGE'

		handlers.setState(existing => {
			const modified = [
				...existing,
				{ user_id: value, amount: 0, percentage: 0, percentageAmount: '0.00' },
			]
			const count = modified.length

			return modified.map(item =>
				calculateShare(item.user_id!, subscription.amount / 100, count, isPercentage)
			)
		})
	}

	const onRemove = (id: string) => {
		if (id === user.id) {
			return notifications.show({
				color: 'orange',
				title: 'Warning',
				message: 'You cannot remove yourself as a collaborator.',
			})
		}
		const isPercentage = subscription.split_strategy === 'PERCENTAGE'

		handlers.setState(existing => {
			const modified = existing.filter(e => e.user_id !== id)
			const count = modified.length

			return modified.map(item =>
				calculateShare(item.user_id!, subscription.amount / 100, count, isPercentage)
			)
		})
	}

	return (
		<div>
			<Select
				searchable
				value={null}
				data={options}
				renderOption={renderOption}
				placeholder="Select contacts"
				leftSection={<IconUser size={18} />}
				onChange={value => onSelect(value)}
			/>
			<Space h="sm" />
			<PillGroup mb="md">
				{collaborators.map(collaborator => {
					const contact = contacts.get(collaborator.user_id)

					if (!contact?.user) return null

					return (
						<Pill
							pl={3}
							bg="dark.5"
							key={collaborator.user_id}
							withRemoveButton
							onRemove={() => onRemove(collaborator.user_id)}
						>
							<Group h="100%" align="center" gap={8} wrap="nowrap">
								<Avatar
									size="xs"
									src={contact.user.image_url}
									name={getUserName(contact.user)}
								/>
								<Text size="xs" lh={0}>
									{getUserName(contact.user)}
								</Text>
							</Group>
						</Pill>
					)
				})}
			</PillGroup>
		</div>
	)
}

export default Step1
