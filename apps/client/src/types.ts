import type z from 'zod'

import type { schema } from '@tracksubs/drizzle'

export type IUsage = z.infer<typeof schema.Usage>

export type IUser = z.infer<typeof schema.User> & { usage: IUsage | null }

export type IService = z.infer<typeof schema.Service>

export type IPaymentMethod = z.infer<typeof schema.PaymentMethod>

export type ISubscription = z.infer<typeof schema.Subscription>

export type ITransaction = z.infer<typeof schema.Transaction>

export type IPlan = {
	title: string
	alerts: number
	type: 'FREE' | 'PAID'
	subscriptions: number
	price: { amount: number; currency: string }
}
