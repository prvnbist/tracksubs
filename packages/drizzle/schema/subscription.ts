import { boolean, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

const subscription = pgTable('subscription', {
	amount: integer('amount').notNull(),
	currency: text('currency').notNull(),
	email_alert: boolean('email_alert').notNull().default(false),
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	interval: text('interval').notNull().default('MONTHLY'),
	is_active: boolean('is_active').default(true),
	next_billing_date: text('next_billing_date').notNull(),
	payment_method_id: uuid('payment_method_id'),
	service: text('service'),
	title: text('title').notNull(),
	website: text('website'),
	user_id: uuid('user_id').notNull(),
})

export default subscription
