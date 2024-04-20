import { Metadata } from 'next'
import { Flex, Title } from '@mantine/core'

import { CreateSubscriptionButton, Subscriptions } from './components'

export const metadata: Metadata = {
	title: 'Subscriptions | TrackSubs',
}

export default function Page(): JSX.Element {
	return (
		<main>
			<Flex component="header" mt="md" mb="md" gap="sm" align="center">
				<Title order={2}>Subscriptions</Title>
				<CreateSubscriptionButton />
			</Flex>
			<Subscriptions />
		</main>
	)
}
