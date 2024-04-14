'use client'

import { IconPlus } from '@tabler/icons-react'

import { modals } from '@mantine/modals'
import { ActionIcon } from '@mantine/core'

import CreateModal from './createModal'

const CreateSubscriptionButton = () => {
	const create = () => {
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
