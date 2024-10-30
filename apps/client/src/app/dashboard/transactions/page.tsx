import { IconBug } from '@tabler/icons-react'

import { Center, Flex, Stack, Text, Title } from '@mantine/core'

import type { PropsWithChildren } from 'react'

import { CreateEmptyState } from 'components'

import { Transactions } from './components'
import { transaction_list } from './action'

export default async function Page() {
	try {
		const data = await transaction_list()

		if (data?.serverError || !data?.data) throw new Error()

		if (data?.data?.length === 0)
			return (
				<Shell>
					<CreateEmptyState
						title="No transactions"
						description="Your transactions will show up here once you mark a due subscription as paid."
					/>
				</Shell>
			)
		return (
			<Shell>
				<Transactions list={data.data} />
			</Shell>
		)
	} catch (error) {
		return (
			<Shell>
				<Center pt={80}>
					<Stack align="center" gap={16}>
						<IconBug size={40} color="var(--mantine-color-dark-3)" />
						<Title order={2}>404</Title>
						<Text c="dimmed">Something went wrong, please refresh the page.</Text>
					</Stack>
				</Center>
			</Shell>
		)
	}
}

const Shell = ({ children }: PropsWithChildren) => (
	<main>
		<Flex component="header" mt="md" mb="md" gap="sm" align="center">
			<Title order={2}>Transactions</Title>
		</Flex>
		{children}
	</main>
)
