'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconTrash } from '@tabler/icons-react'

import { notifications } from '@mantine/notifications'
import { ActionIcon, Box, Group, Input, Space, Stack, Title } from '@mantine/core'

import { useGlobal } from 'state/global'
import { payment_method_create, payment_method_delete } from 'actions'

export default function Page() {
	const formRef = useRef<HTMLFormElement | null>(null)

	const queryClient = useQueryClient()
	const { payment_methods } = useGlobal()

	const deletePaymentMethod = async (id: string) => {
		try {
			await payment_method_delete(id)
			queryClient.invalidateQueries({ queryKey: ['payment_methods'] })
			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully deleted payment method.',
			})
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to delete payment method.',
			})
		}
	}
	return (
		<div>
			<Space h={24} />
			<Title order={2}>Payment Methods</Title>
			<Space h={16} />
			<Box w={480}>
				<Stack gap={8}>
					{payment_methods.map(payment_method => (
						<Group gap={8}>
							<Input flex={1} key={payment_method.id} defaultValue={payment_method.title} />
							<ActionIcon
								size="lg"
								type="submit"
								variant="subtle"
								onClick={() => deletePaymentMethod(payment_method.id)}
							>
								<IconTrash size={18} />
							</ActionIcon>
						</Group>
					))}
				</Stack>
				<Space h={8} />
				<form
					ref={formRef}
					action={async (formData: FormData) => {
						try {
							await payment_method_create(formData)
							queryClient.invalidateQueries({ queryKey: ['payment_methods'] })
							formRef.current?.reset()
							notifications.show({
								color: 'green',
								title: 'Success',
								message: 'Successfully saved payment method.',
							})
						} catch (error) {
							notifications.show({
								color: 'red',
								title: 'Error',
								message: 'Failed to save payment method.',
							})
						}
					}}
				>
					<Group gap={8}>
						<Input flex={1} placeholder="Enter payment method title" name="title" />
						<SubmitButton />
					</Group>
				</form>
			</Box>
		</div>
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
