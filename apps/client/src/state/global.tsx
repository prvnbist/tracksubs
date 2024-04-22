'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'
import { useQueries } from '@tanstack/react-query'

import { Center, Loader } from '@mantine/core'

import { Service, User } from 'types'
import { services, user } from 'actions'
import { Onboarding } from 'components'

interface ContextState {
	user: User
	services: Record<string, Service>
}

const INITITAL_STATE: ContextState = {
	services: {},
	user: {
		id: null,
		is_onboarded: false,
		currency: null,
		timezone: null,
		image_url: null,
		first_name: '',
		last_name: '',
		email: '',
	},
}

const Context = createContext(INITITAL_STATE)

export const useGlobal = () => useContext(Context)

export const GlobalProvider = ({ children }: PropsWithChildren) => {
	const { data, isPending } = useQueries({
		queries: [
			{
				retry: 2,
				queryKey: ['user'],
				refetchOnWindowFocus: false,
				queryFn: (): Promise<User | Error> => user(),
			},
			{
				retry: 2,
				queryKey: ['services'],
				refetchOnWindowFocus: false,
				queryFn: (): Promise<Record<string, Service> | Error> => services(),
			},
		],
		combine: results => {
			return {
				data: {
					user: results[0].data as User,
					services: results[1].data as Record<string, Service>,
				},
				isPending: results.some(result => result.isPending),
			}
		},
	})

	if (isPending)
		return (
			<Center pt={80}>
				<Loader />
			</Center>
		)
	// if (status === 'ERROR')
	// 	return (
	// 		<Center pt={80}>
	// 			<Stack align="center" gap={16}>
	// 				<IconBug size={40} color="var(--mantine-color-dark-3)" />
	// 				<Title order={2}>404</Title>
	// 				<Text c="dimmed">Something went wrong, please refresh the page.</Text>
	// 			</Stack>
	// 		</Center>
	// 	)

	return (
		<Context.Provider value={data}>
			{data.user.is_onboarded ? children : <Onboarding />}
		</Context.Provider>
	)
}
