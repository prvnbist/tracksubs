'use client'

import { Space, Title, Card, Table, SimpleGrid, Badge, Group } from '@mantine/core'

import type { IPlan } from 'types'
import { PLANS } from 'consts'
import { useGlobal } from 'state/global'
import { currencyFormatter } from 'utils'

export default function Page() {
	const { user } = useGlobal()

	const usage = user.usage

	return (
		<div>
			<Space h={24} />
			<Title order={2}>Plan</Title>
			<Space h={16} />
			<SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }}>
				{Object.keys(PLANS).map((key: keyof typeof PLANS) => {
					const plan = PLANS[key]

					if (!plan) return null

					return (
						<Plan
							key={key}
							plan={plan}
							isActive={key === user.plan}
							usage={{
								alerts: usage?.total_alerts,
								subscriptions: usage?.total_subscriptions,
							}}
						/>
					)
				})}
			</SimpleGrid>
		</div>
	)
}

const activePlanStyles = {
	borderWidth: 2,
	borderColor: 'var(--mantine-color-orange-4)',
}

type PlanProps = {
	plan: IPlan
	isActive: boolean
	usage: { alerts?: number; subscriptions?: number }
}

const Plan = ({ plan, isActive, usage = { alerts: 0, subscriptions: 0 } }: PlanProps) => {
	const activeStyles = isActive ? activePlanStyles : {}

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder styles={{ root: activeStyles }}>
			<Group justify="space-between">
				<Title order={5}>{plan.title}</Title>
				{isActive && (
					<Badge variant="light" color="green">
						Active
					</Badge>
				)}
			</Group>
			<Space h={16} />
			<Title order={2}>{currencyFormatter(plan.price.amount, plan.price.currency)}</Title>
			<Space h={16} />
			<Table horizontalSpacing={0}>
				<Table.Tbody>
					<Table.Tr>
						<Table.Td>Subscriptions</Table.Td>
						<Table.Td ta="right" ff="monospace">
							{isActive ? `${usage.subscriptions}/` : ''}
							{plan.subscriptions}
						</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td>Alerts</Table.Td>
						<Table.Td ta="right" ff="monospace">
							{isActive ? `${usage.alerts}/` : ''}
							{plan.alerts}
						</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>
		</Card>
	)
}
