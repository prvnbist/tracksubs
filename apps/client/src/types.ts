import type { JwtPayload } from '@clerk/types'

export interface User {
	id: string | null
	currency: string | null
	timezone: string | null
	is_onboarded: boolean
	image_url: string | null
	first_name: string
	last_name: string
	email: string
	total_alerts: number
	total_subscriptions: number
	plan: 'FREE' | 'BASIC' | 'PRO'
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
	next_billing_date: string | null
	payment_method_id: string
	service: null | string
	is_active: boolean
	email_alert: boolean
}

export interface Transaction {
	id: string
	title: string
	amount: number
	currency: string
	invoice_date: Date
	paid_date: Date
	payment_method: string
	payment_method_id: string | null
	subscription_id: string
	service: string | null
}

export type ActionResponse<T, E> = Promise<
	{ status: 'SUCCESS'; data: T; message?: never } | { status: 'ERROR'; message: E; data?: never }
>

export type Plan = {
		title: string
		alerts: number
		type: 'FREE' | 'PAID'
		subscriptions: number
		price: { amount: number; currency: string }
	}

export type SessionClaim = JwtPayload & {
	metadata: { user_id: string; plan: 'FREE' | 'BASIC' | 'PRO'; currency: string }
}
