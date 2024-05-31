import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

const subscription = pgTable('subscription', {
	amount: integer('amount').notNull(),
	currency: text('currency').notNull(),
	email_alert: boolean('email_alert').default(false),
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	interval: varchar('interval', { length: 225 }).notNull().default('MONTHLY'),
	is_active: boolean('is_active').default(true),
	next_billing_date: text('next_billing_date').notNull(),
	payment_method_id: uuid('payment_method_id'),
	service: varchar('service', { length: 225 }),
	title: text('title').notNull(),
	website: text('website'),
	user_id: uuid('user_id').notNull(),
})

export default subscription
