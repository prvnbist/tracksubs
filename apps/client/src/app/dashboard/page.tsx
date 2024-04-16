import { SimpleGrid, Title } from '@mantine/core'

import { TopFiveMostExpensiveSubscriptions, WeeklySubscriptions } from './components'

export default function Page(): JSX.Element {
	return (
		<main>
			<Title order={2} mt="md" mb="sm">
				Dashboard
			</Title>
			<SimpleGrid cols={3}>
				<WeeklySubscriptions />
				<TopFiveMostExpensiveSubscriptions />
			</SimpleGrid>
		</main>
	)
}
