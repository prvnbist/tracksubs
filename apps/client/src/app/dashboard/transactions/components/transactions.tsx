'use client'

import dayjs from 'dayjs'
import Image from 'next/image'
import { IconBug } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'

import { Center, Group, Loader, ScrollArea, Stack, Table, Text, Title } from '@mantine/core'

import { useGlobal } from 'state/global'
import { currencyFormatter } from 'utils'
import { transaction_list } from 'actions'
import { CreateEmptyState } from 'components'

const noWrapStyles = {
	whiteSpace: 'nowrap',
}

const Transactions = () => {
	const { services } = useGlobal()
	const query = useQuery({
		retry: 2,
		refetchOnWindowFocus: false,
		queryKey: ['transactions'],
		queryFn: () => transaction_list(),
	})

	if (query.isPending)
		return (
			<Center pt={80}>
				<Loader />
			</Center>
		)

	if ((query.status === 'error' && query.error) || query.data.status === 'ERROR')
		return (
			<Center pt={80}>
				<Stack align="center" gap={16}>
					<IconBug size={40} color="var(--mantine-color-dark-3)" />
					<Title order={2}>404</Title>
					<Text c="dimmed">Something went wrong, please refresh the page.</Text>
				</Stack>
			</Center>
		)

	if (query.data.data.length === 0) {
		return (
			<CreateEmptyState
				title="No transactions"
				description="Your transactions will show up here once you mark a due subscription as paid."
			/>
		)
	}
	return (
		<ScrollArea>
			<Table striped withTableBorder withColumnBorders>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Title</Table.Th>
						<Table.Th ta="right">Amount</Table.Th>
						<Table.Th ta="right">Paid On</Table.Th>
						<Table.Th styles={{ th: noWrapStyles }}>Payment Method</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{query.data.data.map(datum => {
						const service = datum.service ? services[datum.service] : null
						return (
							<Table.Tr key={datum.id}>
								<Table.Td>
									<Group
										gap={8}
										vars={() => ({
											root: {
												'--group-wrap': 'no-wrap',
											},
										})}
									>
										{service && (
											<Image
												width={24}
												height={24}
												alt={datum.title ?? ''}
												src={`/services/${service.key}.svg`}
											/>
										)}
										<Text styles={{ root: noWrapStyles }}>{datum.title}</Text>
									</Group>
								</Table.Td>
								<Table.Td ta="right" ff="monospace">
									{currencyFormatter(datum.amount / 100, datum.currency)}
								</Table.Td>
								<Table.Td ta="right" styles={{ td: noWrapStyles }}>
									{dayjs(datum.paid_date).format('MMM DD, YYYY')}
								</Table.Td>
								<Table.Td styles={{ td: noWrapStyles }}>{datum.payment_method}</Table.Td>
							</Table.Tr>
						)
					})}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	)
}

export default Transactions
