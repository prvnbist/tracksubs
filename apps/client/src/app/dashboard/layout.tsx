import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { ModalsProvider } from '@mantine/modals'
import { Container, Divider } from '@mantine/core'

import QueryProvider from 'state/query'
import { GlobalProvider } from 'state/global'

import '@mantine/charts/styles.css'

import Header from './Header'

export const metadata: Metadata = {
	title: 'Dashboard | TrackSubs',
}

export default async function Layout({ children }: { children: React.ReactNode }) {
	const { userId } = auth()

	if (!userId) return redirect('/login')
	return (
		<QueryProvider>
			<GlobalProvider>
				<ModalsProvider>
					<NuqsAdapter>
						<Container size="lg">
							<Header />
							<Divider />
							{children}
						</Container>
					</NuqsAdapter>
				</ModalsProvider>
			</GlobalProvider>
			{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
		</QueryProvider>
	)
}
