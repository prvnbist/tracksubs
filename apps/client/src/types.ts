import type z from 'zod'
import type {
	selectPaymentMethodSchema,
	selectServiceSchema,
	selectSubscriptionSchema,
	selectTransactionSchema,
	selectUsageSchema,
	selectUserSchema,
} from '@tracksubs/drizzle'

export type Usage = z.infer<typeof selectUsageSchema>

export type User = z.infer<typeof selectUserSchema> & { usage: Usage | null }

export type Service = z.infer<typeof selectServiceSchema>

export type PaymentMethod = z.infer<typeof selectPaymentMethodSchema>

export type ISubscription = z.infer<typeof selectSubscriptionSchema>

export type Transaction = z.infer<typeof selectTransactionSchema>

export type Plan = {
	title: string
	alerts: number
	type: 'FREE' | 'PAID'
	subscriptions: number
	price: { amount: number; currency: string }
}
