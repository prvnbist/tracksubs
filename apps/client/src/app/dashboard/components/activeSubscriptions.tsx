import { IconAlertTriangle } from '@tabler/icons-react'
import { Group, Title, Stack, Text, Center } from '@mantine/core'

import { activeSubscriptions } from '../action'

const ActiveSubscriptions = async ({
	currency,
	user_id,
}: { user_id: string; currency: string }) => {
	try {
		if (!user_id)
			return (
				<Center py="md">
					<Title order={5}>No Data</Title>
				</Center>
			)

		const data = await activeSubscriptions({ currency })

		const { total = 0, active = 0 } = data?.data ?? {}

		return (
			<Group gap={0}>
				<Text title="Active" size="48px" c="green.4" ff="monospace">
					{active}
				</Text>
				<Text title="Total" c="dimmed" size="48px" ff="monospace">
					/{total}
				</Text>
			</Group>
		)
	} catch (error) {
		return (
			<Center py="md">
				<Stack align="center" c="red">
					<IconAlertTriangle size={24} />
					<Title order={5}>Failed to load</Title>
				</Stack>
			</Center>
		)
	}
}

export default ActiveSubscriptions
