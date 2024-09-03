import { use } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Title, Stack, Text, SimpleGrid, Center } from '@mantine/core'

import type { ActionResponse } from 'types'

const RenewingSubscriptions = ({
	data,
}: { data: ActionResponse<{ this_week: number; this_month: number }, string> }) => {
	const subscriptions = use(data)

	if (subscriptions.status === 'ERROR')
		return (
			<Center py="md">
				<Stack align="center" c="red">
					<IconAlertTriangle size={24} />
					<Title order={5}>Failed to load</Title>
				</Stack>
			</Center>
		)
	return (
		<SimpleGrid cols={2}>
			<Stack>
				<Title c="dimmed" size="13px" tt="uppercase">
					This Week
				</Title>
				<Text title="Active" size="48px" ff="monospace">
					{subscriptions.data.this_week}
				</Text>
			</Stack>
			<Stack>
				<Title c="dimmed" size="13px" tt="uppercase">
					This Month
				</Title>
				<Text title="Active" size="48px" ff="monospace">
					{subscriptions.data.this_month}
				</Text>
			</Stack>
		</SimpleGrid>
	)
}

export default RenewingSubscriptions
