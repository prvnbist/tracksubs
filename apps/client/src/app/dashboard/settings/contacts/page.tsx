import { Group, Space, Title } from '@mantine/core'

import { Add, Contacts } from './components'

export default function Page() {
	return (
		<div>
			<Space h={24} />
			<Group>
				<Title order={2}>Contacts</Title>
				<Add />
			</Group>
			<Space h={16} />
			<Contacts />
		</div>
	)
}
