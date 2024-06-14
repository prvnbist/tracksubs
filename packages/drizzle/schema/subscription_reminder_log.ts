import { date, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

const subscription_reminder_log = pgTable('subscription_reminder_log', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	amount: integer('amount').notNull(),
	currency: text('currency').notNull(),
	renewal_date: date('renewal_date').notNull(),
	subscription_id: uuid('subscription_id').notNull(),
	user_id: uuid('user_id').notNull(),
	timezone: text('timezone').notNull(),
	executed_at: timestamp('executed_at').notNull(),
})

export default subscription_reminder_log
