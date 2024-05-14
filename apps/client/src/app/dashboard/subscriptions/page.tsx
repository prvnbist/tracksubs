import { Metadata } from 'next'
import { Flex, Group, Title } from '@mantine/core'

import { CreateSubscriptionButton, ExportSubscriptionsButton, Subscriptions } from './components'

export const metadata: Metadata = {
	title: 'Subscriptions | TrackSubs',
}

export default function Page(): JSX.Element {
	return (
		<main>
			<Group component="header" mt="md" mb="md" justify="space-between">
				<Flex gap="sm" align="center">
					<Title order={2}>Subscriptions</Title>
					<CreateSubscriptionButton />
				</Flex>
				<ExportSubscriptionsButton />
			</Group>
			<Subscriptions />
		</main>
	)
}
