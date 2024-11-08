'use client'

import { lazy } from 'react'
import { SimpleGrid, Text } from '@mantine/core'
import { useAction } from 'next-safe-action/hooks'

import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'

import { track } from 'utils'
import { PLANS } from 'consts'
import { useGlobal } from 'state/global'
import type { ISubscription } from 'types'

import Subscription from './subscription'
import { subscriptions_active, subscription_alert, subscriptions_delete } from '../action'

const UpdateModal = lazy(() => import('./updateModal'))
const CollaboratorsModal = lazy(() => import('./collaboratorsModal'))
const CreateTransactionModal = lazy(() => import('./createTransactionModal'))

const Subscriptions = ({ subscriptions = [] }: { subscriptions: Array<ISubscription> }) => {
	const { user } = useGlobal()

	const usage = user.usage!
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

			track(result.email_alert ? 'btn-set-alert' : 'btn-unset-alert')

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

	const { execute: deleteAction } = useAction(subscriptions_delete, {
		onSuccess: ({ data }) => {
			if (data) {
				track('btn-delete-subscription')
				notifications.show({
					color: 'green',
					message: `Successfully deleted the subscription - ${data.title}`,
				})
			}
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to delete the subscription',
			})
		},
	})

	const onSetActive = (subscription: ISubscription) =>
		modals.openConfirmModal({
			title: subscription.is_active ? 'Mark Inactive' : 'Mark Active',
			onConfirm: () => setActive({ id: subscription.id, is_active: !subscription.is_active }),
			children: (
				<Text size="sm">
					{subscription.is_active
						? 'Please confirm if you want to disable '
						: 'Please confirm if you want to enable '}
					the subscription: {subscription.title}
				</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
		})

	const onSetAlert = (subscription: ISubscription) => {
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

	const onDelete = (subscription: ISubscription) => {
		modals.openConfirmModal({
			title: 'Delete Subscription',
			children: <Text size="sm">Are you sure you want to delete this subscription?</Text>,
			labels: { confirm: 'Yes, Delete', cancel: 'Cancel' },
			onConfirm: () => deleteAction({ id: subscription.id }),
		})
	}

	const onMarkPaid = (subscription: ISubscription) =>
		modals.open({
			title: 'Create Transaction',
			children: <CreateTransactionModal subscription={subscription} />,
		})

	const onUpdate = (subscription: ISubscription) =>
		modals.open({
			title: 'Edit Subscription',
			children: <UpdateModal subscription={subscription} />,
		})

	const onManageCollaborators = (subscription: ISubscription) =>
		modals.open({
			title: 'Manage Collaborators',
			children: <CollaboratorsModal subscription={subscription} />,
		})

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
			{subscriptions.map(subscription => (
				<Subscription
					key={subscription.id}
					onDelete={() => onDelete(subscription)}
					onManageCollaborators={() => onManageCollaborators(subscription)}
					onMarkPaid={() => onMarkPaid(subscription)}
					onSetActive={() => onSetActive(subscription)}
					onSetAlert={() => onSetAlert(subscription)}
					onUpdate={() => onUpdate(subscription)}
					subscription={subscription}
				/>
			))}
		</SimpleGrid>
	)
}

export default Subscriptions
