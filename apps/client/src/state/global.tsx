'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import { useAuth } from '@clerk/clerk-react'

import { user } from 'actions'

const INITITAL_STATE: { user: { id: string | null } } = {
	user: { id: null },
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
				setData({ ...INITITAL_STATE, user: { ...result } })
			})()
		}
	}, [isLoaded, userId])

	return <Context.Provider value={data}>{children}</Context.Provider>
}
