'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { IconCheck } from '@tabler/icons-react'
import { useAction } from 'next-safe-action/hooks'

import {
	Center,
	Card,
	Group,
	Title,
	Space,
	Select,
	Stack,
	Button,
	Text,
	LoadingOverlay,
} from '@mantine/core'
import type { ComboboxItem, ComboboxLikeRenderOptionInput } from '@mantine/core'

import Logo from 'assets/svgs/logo'
import { flattenZodValidationErrors } from 'utils'
import { CURRENCIES, TIMEZONES_DISPLAY } from 'consts'

import { onboard } from '../action'

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
	const router = useRouter()
	const [isLoadingOverlayVisible, toggleLoadingOverlay] = useState(false)

	const timezones = TIMEZONES_DISPLAY.map(t => ({
		value: t.timezone,
		label: t.timezone,
		gmt_offset: t.gmt_offset,
	}))

	const { execute: onboardAction, result } = useAction(onboard, {
		onExecute: () => toggleLoadingOverlay(true),
		onSuccess: () => {
			window.location.reload()
		},
		onSettled: () => toggleLoadingOverlay(false),
	})

	return (
		<Center pt={80}>
			<Card withBorder w={480} p={16}>
				<LoadingOverlay
					zIndex={1000}
					visible={isLoadingOverlayVisible}
					overlayProps={{ radius: 'sm', blur: 2 }}
				/>
				<Group gap={8} align="center" justify="center">
					<Logo size={48} />
					<Title order={2}>TrackSubs</Title>
				</Group>
				<form action={onboardAction}>
					<Space h={24} />
					<Select
						searchable
						name="timezone"
						data={timezones}
						label="Timezone"
						renderOption={renderOption}
						placeholder="Select a timezone"
					/>
					<Space h={16} />
					<Select
						name="currency"
						searchable
						label="Currency"
						data={CURRENCIES}
						placeholder="Select a currency"
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
			</Card>
		</Center>
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
