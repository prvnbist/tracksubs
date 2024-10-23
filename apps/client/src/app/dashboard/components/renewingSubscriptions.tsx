import dayjs from 'dayjs'
import { and, count, eq, sql } from 'drizzle-orm'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Title, Stack, Text, SimpleGrid, Center } from '@mantine/core'

import db, { schema } from '@tracksubs/drizzle'

const RenewingSubscriptions = async ({
	currency,
	user_id,
}: { user_id: string; currency: string }) => {
	try {
		const startOfWeek = dayjs().startOf('week')
		const endOfWeek = dayjs().endOf('week')

		const [this_week] = await db
			.select({ count: count() })
			.from(schema.subscription)
			.where(
				and(
					eq(schema.subscription.user_id, user_id),
					eq(schema.subscription.currency, currency),
					eq(schema.subscription.is_active, true),
					sql`next_billing_date >= ${startOfWeek.format(
						'YYYY-MM-DD'
					)} and next_billing_date <= ${endOfWeek.format('YYYY-MM-DD')}`
				)
			)

		const startOfMonth = dayjs().startOf('month')
		const endOfMonth = dayjs().endOf('month')

		const [this_month] = await db
			.select({ count: count() })
			.from(schema.subscription)
			.where(
				and(
					eq(schema.subscription.user_id, user_id),
					eq(schema.subscription.currency, currency),
					eq(schema.subscription.is_active, true),
					sql`next_billing_date >= ${startOfMonth.format(
						'YYYY-MM-DD'
					)} and next_billing_date <= ${endOfMonth.format('YYYY-MM-DD')}`
				)
			)

		return (
			<SimpleGrid cols={2}>
				<Stack>
					<Title c="dimmed" size="13px" tt="uppercase">
						This Week
					</Title>
					<Text title="Active" size="48px" ff="monospace">
						{this_week?.count ?? 0}
					</Text>
				</Stack>
				<Stack>
					<Title c="dimmed" size="13px" tt="uppercase">
						This Month
					</Title>
					<Text title="Active" size="48px" ff="monospace">
						{this_month?.count ?? 0}
					</Text>
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
