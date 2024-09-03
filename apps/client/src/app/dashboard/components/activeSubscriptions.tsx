import { use } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Group, Title, Stack, Text, Center } from '@mantine/core'

import type { ActionResponse } from 'types'

const ActiveSubscriptions = ({
	data,
}: { data: ActionResponse<{ active: number; total: number }, string> }) => {
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
		<Group gap={0}>
			<Text title="Active" size="48px" c="green.4" ff="monospace">
				{subscriptions.data.active}
			</Text>
			<Text title="Total" c="dimmed" size="48px" ff="monospace">
				/{subscriptions.data.total}
			</Text>
		</Group>
	)
}

export default ActiveSubscriptions
