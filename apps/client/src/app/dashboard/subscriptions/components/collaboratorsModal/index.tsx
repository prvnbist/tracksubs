import { useState, useMemo } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { IconUsers, IconCheck, IconChartPie3 } from '@tabler/icons-react'

import { modals } from '@mantine/modals'
import { useListState } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Stepper, Divider, Group, Button } from '@mantine/core'

import { useGlobal } from 'state/global'
import type { ISubscription, IMinimalUser, ISplitStrategy } from 'types'

import Step2 from './step_2'
import Step1 from './step_1'
import { calculateShare } from './utils'
import { manage_collaborators } from '../../action'

export type ISelectedCollaborator = {
	user_id: string
	amount: number
	percentage: number
	percentageAmount: string
}

const ERROR_MESSAGES = {
	SUBSCRIPTION_NOT_FOUND: 'No such subscription exists.',
	NO_CHANGES: 'There are no changes to update.',
	SERVER_ERROR: 'Something went wrong, please refresh the page.',
	COLLABORATOR_NOT_FOUND: "One or more users you're trying to add don't exist.",
	COLLABORATOR_SUBSCRIPTION_LIMIT_EXCEEDED:
		'One or more users have reached their subscription limit.',
} as const

const CollaboratorsModal = ({ subscription }: { subscription: ISubscription }) => {
	const { user, contacts } = useGlobal()

	const [active, setActive] = useState(0)

	const [splitStrategy, setSplitStrategy] = useState<ISplitStrategy>(
		subscription.split_strategy || 'EQUALLY'
	)

	const [collaborators, handlers] = useListState<ISelectedCollaborator>(
		subscription.collaborators.length === 0
			? [
					calculateShare(
						user.id,
						subscription.amount / 100,
						1,
						subscription.split_strategy === 'PERCENTAGE'
					),
				]
			: subscription.collaborators.map(collaborator => ({
					user_id: collaborator.user_id,
					amount: collaborator.amount / 100,
					percentage: Number(collaborator.percentage),
					percentageAmount: String(
						Math.trunc(
							(subscription.amount / 100) * (Number(collaborator.percentage) / 100) * 100
						) / 100
					),
				}))
	)

	const _contacts = useMemo(() => {
		return [...contacts.values()].reduce(
			(map, contact) => {
				const user_id = user.id === contact.sender_id ? contact.receiver_id : contact.sender_id
				const key = user.id === contact.sender_id ? 'receiver' : 'sender'

				return map.set(user_id, { status: contact.status, user: contact[key] })
			},
			new Map<string, { status: string; user: IMinimalUser }>([
				[user.id, { status: 'ACCEPTED', user }],
			])
		)
	}, [user, contacts])

	const { execute, isPending } = useAction(manage_collaborators, {
		onSuccess: () => {
			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Collaborators updated successfully.',
			})
			modals.closeAll()
		},
		onError: ({ error }) => {
			if (error.serverError && error.serverError in ERROR_MESSAGES) {
				return notifications.show({
					color: 'red',
					title: 'Error',
					message: ERROR_MESSAGES[error.serverError as keyof typeof ERROR_MESSAGES],
				})
			}
		},
	})

	const onNextStep = () => {
		if (active === 1) {
			execute({
				subscription_id: subscription.id,
				split_strategy: splitStrategy,
				collaborators: collaborators.map(c => ({
					user_id: c.user_id,
					amount: c.amount,
					percentage: c.percentage,
				})),
			})

			return
		}

		setActive(current => current + 1)
	}

	const onPreviousStep = () => setActive(current => current - 1)

	return (
		<>
			<Stepper size="xs" active={active} onStepClick={setActive}>
				<Stepper.Step
					label="Collaborators"
					icon={<IconUsers size={16} />}
					completedIcon={<IconCheck size={16} />}
				>
					<Step1
						handlers={handlers}
						contacts={_contacts}
						subscription={subscription}
						collaborators={collaborators}
					/>
				</Stepper.Step>
				<Stepper.Step icon={<IconChartPie3 size={16} />} label="Shares">
					<Step2
						handlers={handlers}
						contacts={_contacts}
						subscription={subscription}
						splitStrategy={splitStrategy}
						collaborators={collaborators}
						setSplitStrategy={setSplitStrategy}
					/>
				</Stepper.Step>
			</Stepper>
			<Divider />
			<Group justify="center" mt="md">
				<Button variant="default" onClick={onPreviousStep} disabled={active === 0}>
					Back
				</Button>
				<Button onClick={onNextStep} disabled={isPending || collaborators.length === 1}>
					{active === 0 ? 'Next' : 'Save'}
				</Button>
			</Group>
		</>
	)
}

export default CollaboratorsModal
