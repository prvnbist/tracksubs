'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useAction } from 'next-safe-action/hooks'
import { IconPlus, IconTrash } from '@tabler/icons-react'

import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Box, Group, Input, Space, Stack, Title } from '@mantine/core'

import { track } from 'utils'
import { useGlobal } from 'state/global'

import { payment_method_create, payment_method_delete } from './action'

export default function Page() {
	const formRef = useRef<HTMLFormElement | null>(null)

	const { payment_methods } = useGlobal()

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const { execute: deletePaymentMethod } = useAction(payment_method_delete, {
		onSuccess: () => {
			track('btn-delete-payment-method')
			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully deleted payment method.',
			})
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to delete payment method.',
			})
		},
	})

	const { execute: createPaymentMethod } = useAction(payment_method_create, {
		onSuccess: () => {
			track('btn-create-payment-method')
			formRef.current?.reset()
			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully created payment method.',
			})
		},
		onError: ({ error }) => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message:
					error.validationErrors?.title?._errors?.[0] ?? 'Failed to create payment method.',
			})
		},
	})

	return (
		<Box w={isMobile ? '100%' : 480}>
			<Space h={24} />
			<Title order={2}>Payment Methods</Title>
			<Space h={16} />
			<Stack gap={8}>
				{payment_methods.map(payment_method => (
					<Group gap={8} key={payment_method.id}>
						<Input flex={1} key={payment_method.id} defaultValue={payment_method.title} />
						<ActionIcon
							size="lg"
							type="submit"
							variant="subtle"
							title="Delete Payment"
							onClick={() => deletePaymentMethod({ id: payment_method.id })}
						>
							<IconTrash size={18} />
						</ActionIcon>
					</Group>
				))}
			</Stack>
			<Space h={8} />
			<form ref={formRef} action={createPaymentMethod}>
				<Group gap={8}>
					<Input required flex={1} placeholder="Enter payment method title" name="title" />
					<SubmitButton />
				</Group>
			</form>
		</Box>
	)
}

const SubmitButton = () => {
	const { pending } = useFormStatus()
	return (
		<ActionIcon size="lg" type="submit" disabled={pending} loading={pending}>
			<IconPlus size={18} />
		</ActionIcon>
	)
}
