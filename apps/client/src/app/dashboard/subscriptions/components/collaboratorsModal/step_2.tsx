import { Fragment, useMemo } from 'react'

import type { UseListStateHandlers } from '@mantine/hooks'
import { Avatar, Divider, Grid, Group, NumberInput, Space, Stack, Text, Title } from '@mantine/core'

import { currencyFormatter, getInitials, getUserName } from 'utils'
import type { IMinimalUser, ISubscription } from 'types'

import type { ISelectedCollaborator } from '.'
import { calculateLeftBalance } from './utils'

type ShareProps = {
	subscription: ISubscription
	collaborators: Array<ISelectedCollaborator>
	handlers: UseListStateHandlers<ISelectedCollaborator>
	contacts: Map<string, { status: string; user: IMinimalUser }>
}

const Step2 = (props: ShareProps) => {
	const { collaborators, contacts, handlers, subscription } = props

	const onValueChange = (user_id: string, value: string | number) => {
		handlers.applyWhere(
			share => share.user_id === user_id,
			share => ({ ...share, amount: Number(value) })
		)
	}

	const leftBalance = useMemo(
		() => calculateLeftBalance(subscription.amount / 100, collaborators),
		[subscription.amount, collaborators]
	)

	return (
		<div>
			<Group align="center" justify="space-between">
				<Title order={5}>Shares</Title>
				<Text
					ta="center"
					size="xs"
					ff="monospace"
					c={Number(leftBalance) < 0 ? 'red.5' : 'white'}
				>
					{currencyFormatter(Number(leftBalance), subscription.currency)} remaining of{' '}
					{currencyFormatter(subscription.amount / 100, subscription.currency)}
				</Text>
			</Group>
			<Space h="md" />
			<Stack gap={8} mb="md">
				{collaborators.map((collaborator, index) => {
					const contact = contacts.get(collaborator.user_id)

					if (!contact?.user) return null
					return (
						<Fragment key={collaborator.user_id}>
							<Collaborator
								user={contact.user}
								collaborator={collaborator}
								onValueChange={onValueChange}
								currency={subscription.currency}
							/>
							{index < collaborators.length - 1 && <Divider />}
						</Fragment>
					)
				})}
			</Stack>
		</div>
	)
}

export default Step2

type CollaboratorProps = {
	currency: string
	user: IMinimalUser
	collaborator: ISelectedCollaborator
	onValueChange: (id: string, value: number | string) => void
}

const Collaborator = (props: CollaboratorProps) => {
	const { onValueChange, collaborator, user } = props

	return (
		<Grid columns={5}>
			<Grid.Col span="content">
				<Group h="100%" gap={8} align="center">
					<Avatar size="sm" src={user.image_url} name={getInitials(getUserName(user))} />
					<Stack gap={0}>
						<Text size="sm">
							{user.first_name} {user.last_name}
						</Text>
					</Stack>
				</Group>
			</Grid.Col>
			<Grid.Col span="auto">
				<NumberInput
					min={0}
					w={160}
					ml="auto"
					decimalScale={2}
					allowNegative={false}
					onChange={value => onValueChange(collaborator.user_id, value)}
					value={String(collaborator.amount).replace(/(\.\d{2})\d*/, '$1')}
				/>
			</Grid.Col>
		</Grid>
	)
}
