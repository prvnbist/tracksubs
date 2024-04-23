'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'

import {
	Center,
	Group,
	Loader,
	Paper,
	ScrollArea,
	Space,
	Stack,
	Table,
	Tabs,
	Text,
	Title,
} from '@mantine/core'

import { currencyFormatter } from 'utils'
import {
	subscriptions_analytics_top_five_most_expensive,
	subscriptions_analytics_weekly,
} from 'actions'

export const WeeklySubscriptions = () => {
	const { status, error, data } = useQuery({
		retry: 0,
		refetchOnWindowFocus: false,
		queryKey: ['subscriptions_analytics_weekly'],
		queryFn: () => subscriptions_analytics_weekly(),
	})

	return (
		<Paper withBorder p="md" radius="md">
			<Group justify="space-between">
				<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
					Renewing this week
				</Text>
			</Group>
			<Space h={16} />
			{((status === 'error' && error) || data?.status === 'ERROR') && (
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
			{status === 'success' && data.status === 'SUCCESS' && (
				<>
					{data.data.length > 0 ? (
						<ScrollArea h={180} offsetScrollbars="x">
							<Table stickyHeader striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Currency</Table.Th>
										<Table.Th ta="right">Total</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{data.data.map(datum => (
										<Table.Tr key={datum.currency}>
											<Table.Td>
												{datum.currency} [{datum.count}]
											</Table.Td>
											<Table.Td ta="right" ff="monospace">
												{currencyFormatter(datum.sum / 100, datum.currency)}
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</ScrollArea>
					) : (
						<Center h={180}>
							<Title order={4}>No data yet</Title>
						</Center>
					)}
				</>
			)}
		</Paper>
	)
}

export const TopFiveMostExpensiveSubscriptions = () => {
	const { status, error, data } = useQuery({
		retry: 0,
		refetchOnWindowFocus: false,
		queryKey: ['subscriptions_analytics_top_five_most_expensive'],
		queryFn: () => subscriptions_analytics_top_five_most_expensive(),
	})

	const { tabs, defaultActiveTab } = useMemo(() => {
		if ((status === 'error' && error) || data?.status === 'ERROR')
			return { tabs: [], defaultActiveTab: null }

		const tabs = Object.keys(data?.data ?? {}).sort((a, b) => a.localeCompare(b))
		return { tabs, defaultActiveTab: tabs?.[0] ?? null }
	}, [data])

	return (
		<Paper
			p="md"
			withBorder
			radius="md"
			styles={{ root: { gridColumnStart: 2, gridColumnEnd: 4 } }}
		>
			<Group justify="space-between">
				<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
					Top Five This Year
				</Text>
			</Group>
			<Space h={16} />
			{((status === 'error' && error) || data?.status === 'ERROR') && (
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
			{status === 'success' && data.status === 'SUCCESS' && data.data && (
				<>
					{tabs.length === 0 ? (
						<Center h={180}>
							<Title order={4}>No data yet</Title>
						</Center>
					) : (
						<Tabs defaultValue={defaultActiveTab}>
							<Tabs.List>
								{tabs.map(tab => (
									<Tabs.Tab key={tab} value={tab}>
										{tab}
									</Tabs.Tab>
								))}
							</Tabs.List>
							{tabs.map(tab => {
								const list = data.data[tab]!
								return (
									<Tabs.Panel key={tab} value={tab} pt={8}>
										<ScrollArea h={180} offsetScrollbars="x">
											<Table stickyHeader striped>
												<Table.Thead>
													<Table.Tr>
														<Table.Th>Title</Table.Th>
														<Table.Th>Interval</Table.Th>
														<Table.Th ta="right">Yearly Total</Table.Th>
													</Table.Tr>
												</Table.Thead>
												<Table.Tbody>
													{list.map((datum: any) => (
														<Table.Tr key={datum.title}>
															<Table.Td>{datum.title}</Table.Td>
															<Table.Td>{datum.interval}</Table.Td>
															<Table.Td ta="right" ff="monospace">
																{currencyFormatter(
																	datum.amount / 100,
																	datum.currency
																)}
															</Table.Td>
														</Table.Tr>
													))}
												</Table.Tbody>
											</Table>
										</ScrollArea>
									</Tabs.Panel>
								)
							})}
						</Tabs>
					)}
				</>
			)}
		</Paper>
	)
}
