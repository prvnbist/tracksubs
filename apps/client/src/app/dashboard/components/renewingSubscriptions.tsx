import { IconAlertTriangle } from '@tabler/icons-react'
import { Title, Stack, Text, SimpleGrid, Center } from '@mantine/core'

import { renewingSubscriptions } from '../action'

const RenewingSubscriptions = async ({
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

		const data = await renewingSubscriptions({ currency })

		const { this_week = 0, this_month = 0 } = data?.data ?? {}

		return (
			<SimpleGrid cols={2}>
				<Stack>
					<Text title="Active" size="48px" ff="monospace">
						{this_week}
					</Text>
					<Title c="dimmed" size="12px">
						This Week
					</Title>
				</Stack>
				<Stack>
					<Text title="Active" size="48px" ff="monospace">
						{this_month}
					</Text>
					<Title c="dimmed" size="12px">
						This Month
					</Title>
				</Stack>
			</SimpleGrid>
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

export default RenewingSubscriptions
