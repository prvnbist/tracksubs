import dayjs from 'dayjs'
import { and, eq, sql } from 'drizzle-orm'
import { IconAlertTriangle } from '@tabler/icons-react'

import { Center, Stack, Title } from '@mantine/core'

import db, { schema } from '@tracksubs/drizzle'

import MonthlyOverviewChart from './monthlyOverviewChart'

const MonthlyOverview = async ({ currency, user_id }: { user_id: string; currency: string }) => {
	try {
		const startOfCurrentMonth = dayjs().startOf('month')
		const endOfLastMonthNextYear = dayjs().add(1, 'year').subtract(1, 'month').endOf('month')

		const data = await db.query.subscription.findMany({
			columns: {
				amount: true,
				interval: true,
				next_billing_date: true,
			},
			where: and(
				eq(schema.subscription.user_id, user_id),
				eq(schema.subscription.currency, currency),
				eq(schema.subscription.is_active, true),
				sql`next_billing_date >= ${startOfCurrentMonth.format(
					'YYYY-MM-DD'
				)} and next_billing_date <= ${endOfLastMonthNextYear.format('YYYY-MM-DD')}`
			),
		})

		if (data?.length === 0)
			return (
				<Center h={300}>
					<Title order={5}>No Data</Title>
				</Center>
			)
		return <MonthlyOverviewChart data={data} currency={currency} />
	} catch (error) {
		return (
			<Center h={300}>
				<Stack align="center" c="red">
					<IconAlertTriangle size={24} />
					<Title order={5}>Failed to load</Title>
				</Stack>
			</Center>
		)
	}
}

export default MonthlyOverview
