'use client'

import { lazy } from 'react'
import { IconPlus } from '@tabler/icons-react'

import { modals } from '@mantine/modals'
import { ActionIcon } from '@mantine/core'
import { notifications } from '@mantine/notifications'

import { PLANS } from 'constants/index'
import { useGlobal } from 'state/global'

const CreateModal = lazy(() => import('./createModal'))

const CreateSubscriptionButton = () => {
	const { user } = useGlobal()

	const plan = PLANS[user.plan]!

	const create = () => {
		if (user.total_subscriptions === plan.subscriptions) {
			notifications.show({
				color: 'red.5',
				title: 'Usage Alert',
				message: `Selected plan allows you to create upto ${plan.subscriptions} subscriptions. Please change your plan to the one that fits your needs.`,
			})
			return
		}
		modals.open({
			title: 'Create Subscription',
			children: <CreateModal />,
		})
	}
	return (
		<ActionIcon onClick={create} title="Create Subscription">
			<IconPlus size={18} />
		</ActionIcon>
	)
}

export default CreateSubscriptionButton
