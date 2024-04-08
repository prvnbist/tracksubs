import { ModalsProvider } from '@mantine/modals'
import { Container, Divider } from '@mantine/core'

import { GlobalProvider } from 'state/global'

import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<GlobalProvider>
			<ModalsProvider>
				<Container size="lg">
					<Header />
					<Divider />
					{children}
				</Container>
			</ModalsProvider>
		</GlobalProvider>
	)
}
