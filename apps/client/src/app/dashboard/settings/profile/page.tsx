'use client'

import { useMemo } from 'react'
import { useFormStatus } from 'react-dom'
import { IconCheck } from '@tabler/icons-react'
import { useAction } from 'next-safe-action/hooks'

import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import type { ComboboxLikeRenderOptionInput, ComboboxItem } from '@mantine/core'
import {
	Box,
	Button,
	Group,
	Select,
	SimpleGrid,
	Space,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'

import { useGlobal } from 'state/global'
import { flattenZodValidationErrors } from 'utils'
import { CURRENCIES, TIMEZONES_DISPLAY } from 'constants/index'

import { user_update } from './action'

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

export default function Page() {
	const { user } = useGlobal()

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const { execute: updateUser, result } = useAction(user_update, {
		onSuccess: () => {
			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully updated the user profile.',
			})
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to update the user profile.',
			})
		},
	})


	const timezones = useMemo(() => {
		return TIMEZONES_DISPLAY.map(t => ({
			value: t.timezone,
			label: t.timezone,
			gmt_offset: t.gmt_offset,
		}))
	}, [])

	return (
		<Box w={isMobile ? '100%' : 480}>
			<Space h={24} />
			<Title order={2}>Profile</Title>
			<Space h={16} />
			<form action={updateUser}>
				<SimpleGrid cols={{ base: 1, xs: 2 }}>
					<TextInput
						name="first_name"
						label="First Name"
						required
						defaultValue={user.first_name ?? ''}
					/>
					<TextInput
						name="last_name"
						label="Last Name"
						required
						defaultValue={user.last_name ?? ''}
					/>
				</SimpleGrid>
				<Space h={16} />
				<TextInput label="Email" defaultValue={user.email} readOnly />
				<Space h={16} />
				<Select
					required
					searchable
					label="Timezone"
					data={timezones}
					allowDeselect={false}
					renderOption={renderOption}
					placeholder="Select a timezone"
					name="timezone"
					defaultValue={user.timezone ?? null}
				/>
				<Space h={16} />
				<Select
					required
					label="Currency"
					searchable
					data={CURRENCIES}
					allowDeselect={false}
					placeholder="Select a currency"
					name="currency"
					defaultValue={user.currency ?? null}
				/>
				<Space h={16} />
				<SubmitButton />
			</form>
			{result.validationErrors && (
				<Stack gap={4} mt="md">
					{flattenZodValidationErrors(result.validationErrors).map((error, index) => (
						<Text key={error} c="red" size="sm">
							{error}
						</Text>
					))}
				</Stack>
			)}
		</Box>
	)
}

function SubmitButton() {
	const { pending } = useFormStatus()

	return (
		<Button type="submit" fullWidth disabled={pending} loading={pending}>
			Save
		</Button>
	)
}