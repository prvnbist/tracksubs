import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import type { PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { ModalsProvider } from '@mantine/modals'
import { Container, Divider, Group, Title } from '@mantine/core'

import QueryProvider from 'state/query'
import { GlobalProvider } from 'state/global'
import { payment_methods, services, user } from 'actions'

import '@mantine/charts/styles.css'

import Header from './Header'
import Logo from 'assets/svgs/logo'
import { ErrorState } from 'components'

export const metadata: Metadata = {
	title: 'Dashboard | TrackSubs',
}

export default async function Layout({ children }: PropsWithChildren) {
	const { userId } = auth()

	if (!userId) return redirect('/login')

	try {
		const userData = await user()
		const servicesData = await services()
		const paymentMethodsData = await payment_methods()

		if (userData?.serverError || userData?.data?.auth_id !== userId) {
			throw new Error()
		}

		return (
			<QueryProvider>
				<GlobalProvider
					user={userData.data}
					services={servicesData?.data || {}}
					paymentMethods={paymentMethodsData?.data || []}
				>
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
	} catch (error) {
		return (
			<Container pt={40}>
				<Group mb="xl">
					<Logo size={32} />
					<Title order={3}>TrackSubs</Title>
				</Group>
				<ErrorState title="Something went wrong, please refresh the page!" />
			</Container>
		)
	}
}
