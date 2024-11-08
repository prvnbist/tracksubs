import { Fragment, useMemo } from 'react'

import type { UseListStateHandlers } from '@mantine/hooks'
import {
	Avatar,
	Divider,
	Grid,
	Group,
	NumberInput,
	SegmentedControl,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core'

import { SPLITTING_STRATEGIES } from 'consts'
import { currencyFormatter, getInitials, getUserName } from 'utils'
import type { IMinimalUser, ISplitStrategy, ISubscription } from 'types'

import type { ISelectedCollaborator } from '.'
import { calculateLeftBalance, calculateShare } from './utils'

type ShareProps = {
	subscription: ISubscription
	collaborators: Array<ISelectedCollaborator>
	splitStrategy: ISplitStrategy
	setSplitStrategy: (strategy: ISplitStrategy) => void
	handlers: UseListStateHandlers<ISelectedCollaborator>
	contacts: Map<string, { status: string; user: IMinimalUser }>
}

const Step2 = (props: ShareProps) => {
	const { collaborators, contacts, handlers, setSplitStrategy, splitStrategy, subscription } =
		props

	const onStrategyChange = (strategy: ISplitStrategy) => {
		setSplitStrategy(strategy)

		const isPercentage = strategy === 'PERCENTAGE'

		handlers.setState(existing => {
			return existing.map(item =>
				calculateShare(item.user_id!, subscription.amount / 100, existing.length, isPercentage)
			)
		})
	}

	const onValueChange = (user_id: string, value: string | number) => {
		handlers.applyWhere(
			share => share.user_id === user_id,
			share => ({
				...share,
				...(splitStrategy === 'PERCENTAGE'
					? {
							amount: 0,
							percentage: Number(value),
							percentageAmount: (
								(subscription.amount / 100) *
								(Number(value) / 100)
							).toFixed(2),
						}
					: {
							percentage: 0,
							percentageAmount: '0.00',
							amount: Number(value),
						}),
			})
		)
	}

	const leftBalance = useMemo(
		() => calculateLeftBalance(subscription.amount / 100, collaborators, splitStrategy),
		[subscription.amount, collaborators, splitStrategy]
	)

	return (
		<div>
			<Group align="center" justify="space-between">
				<Title order={5}>Shares</Title>
				<Text
					ta="center"
					size="sm"
					ff="monospace"
					c={Number(leftBalance) < 0 ? 'red.5' : 'white'}
				>
					{currencyFormatter(Number(leftBalance), subscription.currency)} of{' '}
					{currencyFormatter(subscription.amount / 100, subscription.currency)}
				</Text>
			</Group>
			<Space h="md" />
			<SegmentedControl
				fullWidth
				value={splitStrategy!}
				data={SPLITTING_STRATEGIES}
				disabled={collaborators.length === 0}
				onChange={value => onStrategyChange(value as ISplitStrategy)}
			/>
			<Space h="md" />
			<Stack gap={8} mb="md">
				{collaborators.map((collaborator, index) => {
					const contact = contacts.get(collaborator.user_id)

					if (!contact?.user) return null
					return (
						<Fragment key={collaborator.user_id}>
							<Collaborator
								user={contact.user}
								strategy={splitStrategy}
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
	strategy: ISplitStrategy
	collaborator: ISelectedCollaborator
	onValueChange: (id: string, value: number | string) => void
}

const Collaborator = (props: CollaboratorProps) => {
	const { currency, onValueChange, collaborator, strategy, user } = props

	return (
		<Grid columns={5}>
			<Grid.Col span="content">
				<Group h="100%" gap={8} align="center">
					<Avatar size="sm" src={user.image_url} name={getInitials(getUserName(user))} />
					<Stack gap={0}>
						<Text size="sm">
							{user.first_name} {user.last_name}
						</Text>
						{strategy === 'PERCENTAGE' && (
							<Text size="xs" c="dimmed">
								{Number.isInteger(Number(collaborator.percentageAmount)) && '~'}
								{currencyFormatter(Number(collaborator.percentageAmount), currency)}
							</Text>
						)}
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
					disabled={strategy === 'EQUALLY'}
					onChange={value => onValueChange(collaborator.user_id, value)}
					{...(strategy === 'PERCENTAGE' && { max: 100, suffix: '%' })}
					{...(strategy === 'EQUALLY' && { prefix: '~' })}
					value={
						strategy === 'PERCENTAGE'
							? collaborator.percentage
							: String(collaborator.amount).replace(/(\.\d{2})\d*/, '$1')
					}
				/>
			</Grid.Col>
		</Grid>
	)
}
