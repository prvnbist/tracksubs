'use client'

import { useQuery } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'

import { Center, Group, Loader, Paper, ScrollArea, Space, Stack, Table, Text } from '@mantine/core'

import { useGlobal } from 'state/global'
import { currencyFormatter } from 'utils'
import { subscriptions_analytics_weekly } from 'actions'

export const WeeklySubscriptions = () => {
	const { user } = useGlobal()

	const { status, error, data } = useQuery({
		retry: 0,
		enabled: !!user.id,
		refetchOnWindowFocus: false,
		queryKey: ['subscriptions_analytics_weekly', user.id],
		queryFn: () => subscriptions_analytics_weekly(user.id!),
	})

	return (
		<Paper withBorder p="md" radius="md">
			<Group justify="space-between">
				<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
					Renewing this week
				</Text>
			</Group>
			<Space h={16} />
			{status === 'error' && error && (
				<Center h={180}>
					<Stack gap={8} align="center">
						<IconAlertTriangle color="var(--mantine-color-red-4)" />
						<Text size="sm" c="dimmed">
							Failed to fetch
						</Text>
					</Stack>
				</Center>
			)}
			{status === 'pending' && (
				<Center h={180}>
					<Loader />
				</Center>
			)}
			{status === 'success' && (
				<ScrollArea h={180} offsetScrollbars="x">
					<Table stickyHeader>
						<Table.Thead>
							<Table.Tr>
								<Table.Th pl={0}>Currency</Table.Th>
								<Table.Th pr={0} ta="right">
									Total
								</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{data.map(datum => (
								<Table.Tr key={datum.currency}>
									<Table.Td pl={0}>
										{datum.currency} [{datum.count}]
									</Table.Td>
									<Table.Td pr={0} ta="right">
										{currencyFormatter(datum.sum / 100, datum.currency)}
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</ScrollArea>
			)}
		</Paper>
	)
}
