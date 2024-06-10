'use client'

import { useAuth } from '@clerk/clerk-react'
import type { PropsWithChildren } from 'react'
import { IconBug } from '@tabler/icons-react'
import { createContext, useContext, useEffect } from 'react'
import { useQueries } from '@tanstack/react-query'

import { Center, Loader, Stack, Text, Title } from '@mantine/core'

import type { PaymentMethod, Service, User } from 'types'
import { Onboarding } from 'components'
import { payment_method_list, services, user } from 'actions'

interface ContextState {
	user: User
	services: Record<string, Service>
	payment_methods: Array<PaymentMethod>
}

const INITITAL_STATE: ContextState = {
	services: {},
	payment_methods: [],
	user: {
		id: '',
		auth_id: '',
		email: '',
		first_name: '',
		last_name: '',
		image_url: null,
		currency: null,
		is_onboarded: false,
		plan: 'FREE',
		timezone: null,
		usage_id: '',
		usage: { id: '', user_id: '', total_alerts: 0, total_subscriptions: 0 },
	},
}

const Context = createContext(INITITAL_STATE)

export const useGlobal = () => useContext(Context)

export const GlobalProvider = ({ children }: PropsWithChildren) => {
	const { isSignedIn } = useAuth()

	const { data, isPending, retry } = useQueries({
		queries: [
			{
				retry: 2,
				queryKey: ['user'],
				refetchOnWindowFocus: false,
				queryFn: () => user(),
				enabled: isSignedIn,
			},
			{
				retry: 2,
				queryKey: ['services'],
				refetchOnWindowFocus: false,
				queryFn: () => services(),
				enabled: isSignedIn,
			},
			{
				retry: 2,
				refetchOnWindowFocus: false,
				queryKey: ['payment_methods'],
				queryFn: () => payment_method_list(),
				enabled: isSignedIn,
			},
		],
		combine: results => {
			return {
				data: {
					user: results[0].data?.data!,
					services: results[1].data?.data!,
					payment_methods: results[2].data?.data!,
				},
				retry: results[0].refetch,
				isPending: results.some(result => result.isPending),
			}
		},
	})

	useEffect(() => {
		if (!data.user) {
			retry()
		}
	}, [data.user, retry])

	if (isPending)
		return (
			<Center pt={80}>
				<Loader />
			</Center>
		)
	if (!data.user) {
		return (
			<Center pt={80}>
				<Stack align="center" gap={16}>
					<IconBug size={40} color="var(--mantine-color-dark-3)" />
					<Title order={2}>404</Title>
					<Text c="dimmed">Something went wrong, please refresh the page.</Text>
				</Stack>
			</Center>
		)
	}
	return (
		<Context.Provider value={data}>
			{data.user?.is_onboarded ? children : <Onboarding />}
		</Context.Provider>
	)
}
