import { date, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

const transaction = pgTable('transaction', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	amount: integer('amount').notNull(),
	currency: text('currency').notNull(),
	invoice_date: date('invoice_date').notNull(),
	paid_date: date('paid_date').notNull(),
	payment_method_id: uuid('payment_method_id'),
	subscription_id: uuid('subscription_id').notNull(),
	user_id: uuid('user_id').notNull(),
})

export default transaction
