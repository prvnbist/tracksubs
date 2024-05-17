'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconTrash } from '@tabler/icons-react'

import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
	ActionIcon,
	Box,
	Group,
	Input,
	Space,
	Stack,
	Title,
	useComputedColorScheme,
} from '@mantine/core'

import { useGlobal } from 'state/global'
import { payment_method_create, payment_method_delete } from 'actions'

export default function Page() {
	const formRef = useRef<HTMLFormElement | null>(null)

	const queryClient = useQueryClient()
	const { payment_methods } = useGlobal()

	const scheme = useComputedColorScheme()
	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const deletePaymentMethod = async (id: string) => {
		try {
			const result = await payment_method_delete(id)
			if (result.status === 'ERROR') {
				throw Error()
			}

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
							title="Delete Payment"
							variant={scheme === 'light' ? 'default' : 'subtle'}
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
						if (!(formData.get('title') as string)?.trim()) {
							notifications.show({
								color: 'orange',
								title: 'Warning',
								message: 'Please enter the payment method title',
							})
							return
						}

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
