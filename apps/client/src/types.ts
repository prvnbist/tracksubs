export interface User {
	id: string | null
	currency: string | null
	timezone: string | null
	is_onboarded: boolean
	image_url: string | null
	first_name: string
	last_name: string
	email: string
}

export interface Service {
	id: string
	key: string
	title: string
	website: string
}

export interface PaymentMethod {
	id: string
	title: string
}

export interface ISubscription {
	id: string
	title: string
	website: string
	amount: number
	currency: string
	interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
	user_id: string
	next_billing_date: string
	payment_method_id: string
	service: null | string
	is_active: boolean
}

export type ActionResponse<T, E> = Promise<
	{ status: 'SUCCESS'; data: T; message?: never } | { status: 'ERROR'; message: E; data?: never }
>
