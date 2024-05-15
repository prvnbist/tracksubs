'use client'

import { useMemo } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'

import { useForm } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import type { ComboboxLikeRenderOptionInput, ComboboxItem } from '@mantine/core'
import {
	Box,
	Button,
	Group,
	Input,
	Select,
	SimpleGrid,
	Space,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'

import { User } from 'types'
import { user_update } from 'actions'
import { useGlobal } from 'state/global'
import { CURRENCIES, TIMEZONES_DISPLAY } from 'constants/index'

const renderOption = ({
	option,
	checked,
}: ComboboxLikeRenderOptionInput<ComboboxItem & { gmt_offset?: string }>) => (
	<Group flex="1" gap="xs" justify="space-between">
		<Group gap={8}>
			{checked && <IconCheck size={16} color="var(--mantine-color-green-4)" />}
			{option.label}
		</Group>
		<Text size="sm" c="dimmed" ff="monospace">
			{option.gmt_offset}
		</Text>
	</Group>
)

interface FormState {
	first_name: string
	last_name: string
	currency: string | null
	timezone: string | null
}

export default function Page() {
	const { user } = useGlobal()

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const queryClient = useQueryClient()

	const form = useForm<FormState>({
		initialValues: {
			first_name: user.first_name,
			last_name: user.last_name,
			currency: user.currency,
			timezone: user.timezone,
		},
		validate: {
			first_name: (value: string) => (value.trim() ? null : 'Please enter your first name'),
			last_name: (value: string) => (value.trim() ? null : 'Please enter your last name'),
		},
	})

	const timezones = useMemo(() => {
		return TIMEZONES_DISPLAY.map(t => ({
			value: t.timezone,
			label: t.timezone,
			gmt_offset: t.gmt_offset,
		}))
	}, [])

	const save = async (values: Partial<User>) => {
		try {
			await user_update({
				...(user.first_name !== values.first_name && { first_name: values.first_name }),
				...(user.last_name !== values.last_name && { last_name: values.last_name }),
				...(user.currency !== values.currency && { currency: values.currency }),
				...(user.timezone !== values.timezone && { timezone: values.timezone }),
			})
			notifications.show({ title: 'Success', message: 'Successfully saved profile details.' })

			queryClient.invalidateQueries({ queryKey: ['user'] })
		} catch (error) {
			notifications.show({ title: 'Error', message: 'Failed to save profile details.' })
		}
	}

	const isDirty = form.isDirty()

	return (
		<Box w={isMobile ? '100%' : 480}>
			<Space h={24} />
			<Title order={2}>Profile</Title>
			<Space h={16} />
			<form onSubmit={form.onSubmit(values => save(values))}>
				<SimpleGrid cols={{ base: 1, xs: 2 }}>
					<Stack gap={4}>
						<Input.Label>First Name</Input.Label>
						<TextInput {...form.getInputProps('first_name')} />
					</Stack>
					<Stack gap={4}>
						<Input.Label>Last Name</Input.Label>
						<TextInput {...form.getInputProps('last_name')} />
					</Stack>
				</SimpleGrid>
				<Space h={16} />
				<Stack gap={4}>
					<Input.Label>Email</Input.Label>
					<TextInput defaultValue={user.email} readOnly />
				</Stack>
				<Space h={16} />
				<Stack gap={4}>
					<Input.Label>Timezone</Input.Label>
					<Select
						searchable
						data={timezones}
						allowDeselect={false}
						renderOption={renderOption}
						placeholder="Select a timezone"
						{...form.getInputProps('timezone')}
					/>
				</Stack>
				<Space h={16} />
				<Stack gap={4}>
					<Input.Label>Currency</Input.Label>
					<Select
						searchable
						data={CURRENCIES}
						allowDeselect={false}
						placeholder="Select a currency"
						{...form.getInputProps('currency')}
					/>
				</Stack>
				<Space h={16} />
				<Button fullWidth type="submit" disabled={!isDirty}>
					Save
				</Button>
			</form>
		</Box>
	)
}
