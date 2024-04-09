'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import { useAuth } from '@clerk/clerk-react'

import { services, user } from 'actions'

interface Service {
	id: string
	key: string
	title: string
	website: string
}

const INITITAL_STATE: { user: { id: string | null }; services: Service[] } = {
	user: { id: null },
	services: [],
}

const Context = createContext(INITITAL_STATE)

export const useGlobal = () => useContext(Context)

export const GlobalProvider = ({ children }: PropsWithChildren) => {
	const { isLoaded, userId } = useAuth()

	const [data, setData] = useState(INITITAL_STATE)

	useEffect(() => {
		if (isLoaded) {
			;(async () => {
				const result = await user()
				setData(existing => ({ ...existing, user: { ...result } }))
			})()
		}
	}, [isLoaded, userId])

	useEffect(() => {
		;(async () => {
			const data = await services()
			setData(existing => ({ ...existing, services: data as Service[] }))
		})()
	}, [])

	return <Context.Provider value={data}>{children}</Context.Provider>
}
