import { Metadata } from 'next'

import { Flex, Title } from '@mantine/core'

import { Transactions } from './components'

export const metadata: Metadata = {
	title: 'Transactions | TrackSubs',
}

export default function Page() {
	return (
		<main>
			<Flex component="header" mt="md" mb="md" gap="sm" align="center">
				<Title order={2}>Transactions</Title>
			</Flex>
			<Transactions />
		</main>
	)
}
