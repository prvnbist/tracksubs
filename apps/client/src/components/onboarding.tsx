import { useMemo, useState } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'

import {
	Button,
	Card,
	Center,
	Group,
	Input,
	Select,
	Space,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { ComboboxItem, ComboboxLikeRenderOptionInput } from '@mantine/core'

import Logo from 'assets/svgs/logo'
import { user_update } from 'actions'
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

const Onboarding = () => {
	const queryClient = useQueryClient()

	const [timezone, setTimezone] = useState<string | null>(null)
	const [currency, setCurrency] = useState<string | null>(null)

	const timezones = useMemo(() => {
		return TIMEZONES_DISPLAY.map(t => ({
			value: t.timezone,
			label: t.timezone,
			gmt_offset: t.gmt_offset,
		}))
	}, [])

	const save = async () => {
		try {
			await user_update({ timezone, currency, is_onboarded: true })

			queryClient.invalidateQueries({ queryKey: ['user'] })
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: `Failed to save user preferences, please try again.`,
			})
		}
	}
	return (
		<Center pt={80}>
			<Card withBorder w={480} p={16}>
				<Group gap={8} align="center" justify="center">
					<Logo size={48} />
					<Title order={2}>TrackSubs</Title>
				</Group>
				<Space h={24} />
				<Stack gap={4}>
					<Input.Label>Timezone</Input.Label>
					<Select
						searchable
						data={timezones}
						value={timezone}
						renderOption={renderOption}
						placeholder="Select a timezone"
						onChange={value => setTimezone(value)}
					/>
				</Stack>
				<Space h={16} />
				<Stack gap={4}>
					<Input.Label>Currency</Input.Label>
					<Select
						searchable
						value={currency}
						data={CURRENCIES}
						placeholder="Select a currency"
						onChange={value => setCurrency(value)}
					/>
				</Stack>
				<Space h={16} />
				<Button fullWidth disabled={!currency && !timezone} onClick={save}>
					Save
				</Button>
			</Card>
		</Center>
	)
}

export default Onboarding
