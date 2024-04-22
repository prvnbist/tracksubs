'use client'

import { useAuth } from '@clerk/clerk-react'
import { IconBug } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import { Center, Loader, Stack, Text, Title } from '@mantine/core'

import { User } from 'types'
import { services, user } from 'actions'
import { Onboarding } from 'components'

interface Service {
	id: string
	key: string
	title: string
	website: string
}

interface ContextState {
	user: User
	services: Record<string, Service>
	setData?: (data: any) => void
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
	const { isLoaded, userId } = useAuth()

	const [status, setStatus] = useState('LOADING')

	const [data, setData] = useState(INITITAL_STATE)

	useEffect(() => {
		if (isLoaded) {
			;(async () => {
				setStatus('LOADING')
				try {
					const result = await user()
					setData(existing => ({ ...existing, user: { ...result } }))
					setStatus('SUCCESS')
				} catch (error) {
					setStatus('ERROR')
				}
			})()
		}
	}, [isLoaded, userId])

	useEffect(() => {
		;(async () => {
			const data = await services()
			if (Array.isArray(data) && data.length > 0) {
				setData(existing => ({
					...existing,
					services: (data as Service[]).reduce((acc: Record<string, Service>, curr) => {
						acc[curr.key] = curr
						return acc
					}, {}),
				}))
			}
		})()
	}, [])

	if (status === 'LOADING')
		return (
			<Center pt={80}>
				<Loader />
			</Center>
		)
	if (status === 'ERROR')
		return (
			<Center pt={80}>
				<Stack align="center" gap={16}>
					<IconBug size={40} color="var(--mantine-color-dark-3)" />
					<Title order={2}>404</Title>
					<Text c="dimmed">Something went wrong, please refresh the page.</Text>
				</Stack>
			</Center>
		)
	return (
		<Context.Provider value={{ ...data, setData }}>
			{data.user.is_onboarded ? children : <Onboarding />}
		</Context.Provider>
	)
}
