import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { ModalsProvider } from '@mantine/modals'
import { Container, Divider, Group, Title } from '@mantine/core'

import { GlobalProvider } from 'state/global'
import { contacts, services, user } from 'actions'

import '@mantine/charts/styles.css'

import Logo from 'assets/svgs/logo'
import { ErrorState } from 'components'

import Header from './Header'
import { Onboarding } from './components'

export const metadata: Metadata = {
	title: 'Dashboard | TrackSubs',
}

export default async function Layout({ children }: PropsWithChildren) {
	try {
		const _user = await user()

		if (_user?.serverError || !_user?.data?.id) {
			throw new Error()
		}

		const { data } = _user

		if (!data.is_onboarded) {
			return <Onboarding />
		}

		const _services = await services()
		const _contacts = await contacts()

		return (
			<GlobalProvider
				user={data}
				contacts={_contacts?.data || []}
				services={_services?.data || {}}
				paymentMethods={data?.payment_methods || []}
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
