'use client'

import { Space, Title, Card, Table, SimpleGrid, Badge, Group, Text } from '@mantine/core'

import type { Plan } from 'types'
import { PLANS } from 'constants/index'
import { useGlobal } from 'state/global'
import { currencyFormatter } from 'utils'

export default function Page() {
	const { user } = useGlobal()


	return (
		<div>
			<Space h={24} />
			<Group justify="space-between">
				<Title order={2}>Plan</Title>
				<Badge variant="default">Monthly</Badge>
			</Group>
			<Space h={16} />
			<SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }}>
				{Object.keys(PLANS).map((key: keyof typeof PLANS) => (
					<Plan
						plan={PLANS[key]!}
						isActive={key === user.plan}
						usage={{ alerts: user.total_alerts, subscriptions: user.total_subscriptions }}
					/>
				))}
			</SimpleGrid>
		</div>
	)
}

const activePlanStyles = {
	borderWidth: 2,
	borderColor: 'var(--mantine-color-orange-4)',
}

type PlanProps = {
	plan: Plan
	isActive: boolean
	usage: { alerts: number; subscriptions: number }
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
							{isActive ? `${usage.subscriptions}/` : ``}
							{plan.subscriptions}
						</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td>Alerts</Table.Td>
						<Table.Td ta="right" ff="monospace">
							{isActive ? `${usage.alerts}/` : ``}
							{plan.alerts}
						</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>
		</Card>
	)
}
