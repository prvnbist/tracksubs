import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { Group, Paper, Space, Title } from '@mantine/core'

import knex from '@tracksubs/db'

import { SessionClaim } from 'types'

import { CurrencySelector, MonthlyOverview } from './components'

export default async function Page(props: any) {
	const { sessionClaims } = auth()

	const { user_id, currency } = (sessionClaims as SessionClaim)?.metadata

	if (!props.searchParams.currency) return redirect(`/dashboard/?currency=${currency}`)

	const currencies = await knex('subscription')
		.where('user_id', user_id)
		.select('currency')
		.orderBy('currency', 'asc')
		.distinct()

	const monthlyOverview = await knex('subscription')
		.select('amount', 'interval', 'next_billing_date')
		.where({
			user_id,
			currency: props.searchParams.currency,
		})
		.andWhereRaw(`EXTRACT(YEAR FROM next_billing_date) = EXTRACT(YEAR FROM now())`)

	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Title order={2}>Dashboard</Title>
				{currencies.length > 0 && <CurrencySelector currencies={currencies} />}
			</Group>
			<Paper p="xl" withBorder shadow="md">
				<Title order={4}>Monthly Overview</Title>
				<Space h={24} />
				<MonthlyOverview currency={props.searchParams.currency} data={monthlyOverview} />
			</Paper>
		</main>
	)
}
