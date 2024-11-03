import { Space, Title } from '@mantine/core'

import { Contacts } from './components'

export default function Page() {
	return (
		<div>
			<Space h={24} />
			<Title order={2}>Contacts</Title>
			<Space h={16} />
			<Contacts />
		</div>
	)
}
