import { sql } from 'drizzle-orm'
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { boolean, check, date, integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

import user from './user'
import service from './service'
import payment_method from './payment_method'

const subscription = pgTable(
	'subscription',
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		title: text().notNull(),
		website: text(),
		currency: varchar({ length: 3 }).notNull(),
		amount: integer().notNull().default(0),
		next_billing_date: date().notNull(),
		interval: varchar({ length: 20 }).default('MONTHLY').notNull(),
		email_alert: boolean().default(false).notNull(),
		is_active: boolean().default(true).notNull(),

		user_id: uuid()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		service: varchar({ length: 30 }).references(() => service.key, {
			onDelete: 'set null',
		}),
		payment_method_id: uuid().references(() => payment_method.id, {
			onDelete: 'set null',
		}),
	},
	table => ({
		amountConstraint: check('amount', sql`${table.amount} > 0`),
	})
)

export const Subscription = createSelectSchema(subscription)
export const NewSubscription = createInsertSchema(subscription)

export default subscription
