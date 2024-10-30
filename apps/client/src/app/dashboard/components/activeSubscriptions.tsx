import { and, eq } from 'drizzle-orm'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Group, Title, Stack, Text, Center } from '@mantine/core'

import db, { schema } from '@tracksubs/drizzle'

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

		const data = await db.query.subscription.findMany({
			columns: { is_active: true },
			where: and(
				eq(schema.subscription.user_id, user_id),
				eq(schema.subscription.currency, currency)
			),
		})
		const active = data.filter(datum => datum.is_active).length

		return (
			<Group gap={0}>
				<Text title="Active" size="48px" c="green.4" ff="monospace">
					{active}
				</Text>
				<Text title="Total" c="dimmed" size="48px" ff="monospace">
					/{data.length}
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
