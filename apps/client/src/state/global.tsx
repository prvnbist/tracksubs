'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'


import type { PaymentMethod, Service, User } from 'types'

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

type GlobalProviderProps = {
	user: User
	services: Record<string, Service>
	paymentMethods: Array<PaymentMethod>
} & PropsWithChildren

export const GlobalProvider = ({
	user,
	services,
	paymentMethods,
	children,
}: GlobalProviderProps) => (
	<Context.Provider
		value={{
			user,
			services,
			payment_methods: paymentMethods,
		}}
	>
		{children}
	</Context.Provider>
)
