import { Container, Divider } from '@mantine/core'

import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Container size="lg">
			<Header />
			<Divider />
			{children}
		</Container>
	)
}
