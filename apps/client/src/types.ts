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
}

export type ActionResponse<T> = Promise<T | Error>
