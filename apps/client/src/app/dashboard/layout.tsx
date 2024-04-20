import { Metadata } from 'next'
import { ModalsProvider } from '@mantine/modals'
import { Container, Divider } from '@mantine/core'

import QueryProvider from 'state/query'
import { GlobalProvider } from 'state/global'

import '@mantine/charts/styles.css'

import Header from './Header'

export const metadata: Metadata = {
	title: 'Dashboard | TrackSubs',
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<QueryProvider>
			<GlobalProvider>
				<ModalsProvider>
					<Container size="lg">
						<Header />
						<Divider />
						{children}
					</Container>
				</ModalsProvider>
			</GlobalProvider>
		</QueryProvider>
	)
}
