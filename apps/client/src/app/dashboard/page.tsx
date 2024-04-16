import { SimpleGrid, Title } from '@mantine/core'

import { WeeklySubscriptions } from './components'

export default function Page(): JSX.Element {
	return (
		<main>
			<Title order={2} mt="md" mb="sm">
				Dashboard
			</Title>
			<SimpleGrid cols={3}>
				<WeeklySubscriptions />
			</SimpleGrid>
		</main>
	)
}
