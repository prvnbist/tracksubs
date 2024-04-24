'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-react'

import { notifications } from '@mantine/notifications'
import {
	ActionIcon,
	Box,
	Center,
	Group,
	Input,
	Loader,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core'

import { payment_method_create, payment_method_delete, payment_method_list } from 'actions'

export default function Page() {
	const formRef = useRef<HTMLFormElement | null>(null)

	const { status, data, refetch } = useQuery({
		queryKey: ['payment_methods'],
		queryFn: () => payment_method_list(),
	})

	const deletePaymentMethod = async (id: string) => {
		try {
			await payment_method_delete(id)
			refetch()
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
					{status === 'pending' && (
						<Center py={24}>
							<Loader />
						</Center>
					)}
					{(status === 'error' || data?.status === 'ERROR') && (
						<Center h={180}>
							<Stack gap={8} align="center">
								<IconAlertTriangle color="var(--mantine-color-red-4)" />
								<Text size="sm" c="dimmed">
									Failed to fetch
								</Text>
							</Stack>
						</Center>
					)}
					{status === 'success' &&
						data.status === 'SUCCESS' &&
						data.data.map(datum => (
							<Group gap={8}>
								<Input flex={1} key={datum.id} defaultValue={datum.title} />
								<ActionIcon
									size="lg"
									type="submit"
									variant="subtle"
									onClick={() => deletePaymentMethod(datum.id)}
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
							refetch()
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
