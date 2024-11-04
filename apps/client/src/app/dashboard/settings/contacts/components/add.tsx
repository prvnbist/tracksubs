'use client'

import { useFormStatus } from 'react-dom'
import { IconPlus } from '@tabler/icons-react'
import { useAction } from 'next-safe-action/hooks'
import { notifications } from '@mantine/notifications'

import { modals } from '@mantine/modals'
import { ActionIcon, Button, Space, TextInput } from '@mantine/core'

import { add } from '../action'

const Add = () => (
	<ActionIcon
		onClick={() =>
			modals.open({
				title: 'Add Contact',
				children: <Form />,
			})
		}
	>
		<IconPlus size={18} />
	</ActionIcon>
)

export default Add

const Form = () => {
	const { execute: addAction } = useAction(add, {
		onSuccess: () => {
			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully added the contact.',
			})
			modals.closeAll()
		},
		onError: ({ error }) => {
			let message = 'Failed to add the contact.'

			if (error.serverError) {
				if (error.serverError === 'SELF_EMAIL_ERROR') {
					message = 'You cannot add yourself as a contact.'
				} else if (error.serverError === 'EMAIL_NOT_FOUND') {
					message = 'No such user exists.'
				} else if (error.serverError === 'CONTACT_ALREADY_EXISTS') {
					message = 'Contact already exists.'
				}
			}

			notifications.show({
				message,
				color: 'red',
				title: 'Error',
			})
		},
	})
	return (
		<form action={addAction}>
			<TextInput
				required
				type="email"
				name="email"
				label="Email"
				data-autofocus
				placeholder="Enter the email"
			/>
			<Space h="sm" />
			<SubmitButton />
		</form>
	)
}

function SubmitButton() {
	const { pending } = useFormStatus()

	return (
		<Button type="submit" fullWidth disabled={pending} loading={pending}>
			Add
		</Button>
	)
}
