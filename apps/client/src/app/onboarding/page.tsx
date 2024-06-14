'use client'

import { useFormStatus } from 'react-dom'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { IconCheck } from '@tabler/icons-react'

import {
	Center,
	Card,
	Group,
	Title,
	Space,
	Select,
	Stack,
	InputLabel,
	Button,
	Text,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { ComboboxItem, ComboboxLikeRenderOptionInput } from '@mantine/core'

import Logo from 'assets/svgs/logo'
import { CURRENCIES, TIMEZONES_DISPLAY } from 'constants/index'

import { onboard } from './actions'

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

export default function Onboarding() {
	const { user } = useUser()
	const router = useRouter()
	const timezones = TIMEZONES_DISPLAY.map(t => ({
		value: t.timezone,
		label: t.timezone,
		gmt_offset: t.gmt_offset,
	}))

	const save = async (formData: FormData) => {
		try {
			const response = await onboard(formData)

			if (response.status === 'SUCCESS') {
				await user?.reload()
				router.push('/dashboard')
			} else {
				throw Error(response.message)
			}
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: (error as Error).message,
			})
		}
	}

	return (
		<form action={save}>
			<Center pt={80}>
				<Card withBorder w={480} p={16}>
					<Group gap={8} align="center" justify="center">
						<Logo size={48} />
						<Title order={2}>TrackSubs</Title>
					</Group>
					<Space h={24} />
					<Stack gap={4}>
						<InputLabel>Timezone</InputLabel>
						<Select
							searchable
							name="timezone"
							data={timezones}
							renderOption={renderOption}
							placeholder="Select a timezone"
						/>
					</Stack>
					<Space h={16} />
					<Stack gap={4}>
						<InputLabel>Currency</InputLabel>
						<Select
							name="currency"
							searchable
							data={CURRENCIES}
							placeholder="Select a currency"
						/>
					</Stack>
					<Space h={16} />
					<SubmitButton />
				</Card>
			</Center>
		</form>
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
