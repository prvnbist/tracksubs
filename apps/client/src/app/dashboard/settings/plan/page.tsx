'use client'

import { Space, Title, Box, Card, Text, Table } from '@mantine/core'

import { PLANS } from 'constants/index'
import { useGlobal } from 'state/global'

export default function Page() {
	const { user } = useGlobal()

	const plan = PLANS[user.plan]
	return (
		<div>
			<Space h={24} />
			<Title order={2}>Plan</Title>
			<Space h={16} />
			<Box w={480}>
				<Card shadow="sm" padding="lg" radius="md" withBorder>
					<Text size="sm" fw={500} c="dimmed" tt="uppercase">
						Your Plan
					</Text>
					<Space h={4} />
					<Title order={2}>{plan.title}</Title>
					<Space h={16} />
					<Table horizontalSpacing={0}>
						<Table.Tbody>
							<Table.Tr>
								<Table.Td>Subscriptions</Table.Td>
								<Table.Td ta="right">
									{user.total_subscriptions}/{plan.subscriptions}
								</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td>Alerts</Table.Td>
								<Table.Td ta="right">
									{user.total_alerts}/{plan.alerts}
								</Table.Td>
							</Table.Tr>
						</Table.Tbody>
					</Table>
				</Card>
			</Box>
		</div>
	)
}
