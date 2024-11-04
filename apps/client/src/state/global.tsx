'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

import type { IContact, IPaymentMethod, IService, IUser } from 'types'

interface ContextState {
	user: IUser
	contacts: Array<IContact>
	services: Record<string, IService>
	payment_methods: Array<IPaymentMethod>
}

const INITITAL_STATE: ContextState = {
	services: {},
	contacts: [],
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
	user: IUser
	contacts: Array<IContact>
	services: Record<string, IService>
	paymentMethods: Array<IPaymentMethod>
} & PropsWithChildren

export const GlobalProvider = ({
	user,
	contacts,
	services,
	paymentMethods,
	children,
}: GlobalProviderProps) => (
	<Context.Provider
		value={{
			user,
			contacts,
			services,
			payment_methods: paymentMethods,
		}}
	>
		{children}
	</Context.Provider>
)
