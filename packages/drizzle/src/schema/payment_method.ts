import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'

import user from './user'

const payment_method = pgTable('payment_method', {
	id: uuid().primaryKey().notNull().defaultRandom(),
	title: varchar({ length: 30 }).notNull(),
	user_id: uuid()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})

export const PaymentMethod = createSelectSchema(payment_method)
export const NewPaymentMethod = createInsertSchema(payment_method)

export default payment_method
