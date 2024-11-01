'use client'

import dayjs from 'dayjs'
import Image from 'next/image'

import { Group, ScrollArea, Table, Text } from '@mantine/core'

import { currencyFormatter } from 'utils'

import type { ITransaction } from 'types'

const noWrapStyles = {
	whiteSpace: 'nowrap',
}

type TransactionsProps = {
	list: Array<
		ITransaction & { service: string | null; title: string | null; payment_method: string | null }
	>
}

const Transactions = ({ list }: TransactionsProps) => {
	return (
		<ScrollArea>
			<Table striped withTableBorder withColumnBorders>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Title</Table.Th>
						<Table.Th ta="right">Amount</Table.Th>
						<Table.Th ta="right">Invoice Date</Table.Th>
						<Table.Th ta="right">Paid On</Table.Th>
						<Table.Th styles={{ th: noWrapStyles }}>Payment Method</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{list.map(item => (
						<Table.Tr key={item.id}>
							<Table.Td>
								<Group
									gap={8}
									vars={() => ({
										root: {
											'--group-wrap': 'no-wrap',
										},
									})}
								>
									{item.service && (
										<Image
											width={24}
											height={24}
											alt={item.title ?? ''}
											src={`/services/${item.service}.svg`}
										/>
									)}
									<Text styles={{ root: noWrapStyles }}>{item.title}</Text>
								</Group>
							</Table.Td>
							<Table.Td ta="right" ff="monospace">
								{currencyFormatter(item.amount / 100, item.currency)}
							</Table.Td>
							<Table.Td ta="right" styles={{ td: noWrapStyles }}>
								{dayjs(item.invoice_date).format('MMM DD, YYYY')}
							</Table.Td>
							<Table.Td ta="right" styles={{ td: noWrapStyles }}>
								{dayjs(item.paid_date).format('MMM DD, YYYY')}
							</Table.Td>
							<Table.Td styles={{ td: noWrapStyles }}>{item.payment_method}</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	)
}

export default Transactions
