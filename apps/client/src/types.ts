import type z from 'zod'

import type { schema } from '@tracksubs/drizzle'

export type IMinimalUser = Pick<IUser, 'id' | 'first_name' | 'last_name' | 'image_url' | 'email'>

export type IContact = z.infer<typeof schema.Contact> & {
	sender: IMinimalUser
	receiver: IMinimalUser
}

export type IUsage = z.infer<typeof schema.Usage>

export type IUser = z.infer<typeof schema.User> & { usage?: IUsage | null }

export type IService = z.infer<typeof schema.Service>

export type IPaymentMethod = z.infer<typeof schema.PaymentMethod>

export type ICollaborator = z.infer<typeof schema.Collaborator> & { user: IMinimalUser }

export type ISplitStrategy = 'CUSTOM' | null

export type ISubscription = z.infer<typeof schema.Subscription> & {
		collaborators: Array<ICollaborator>
		split_strategy: ISplitStrategy
	}

export type ITransaction = z.infer<typeof schema.Transaction>

export type IPlan = {
	title: string
	alerts: number
	type: 'FREE' | 'PAID'
	subscriptions: number
	price: { amount: number; currency: string }
}
