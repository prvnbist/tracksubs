import { sql } from 'drizzle-orm'
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { check, date, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

import user from './user'
import subscription from './subscription'
import payment_method from './payment_method'

const transaction = pgTable(
	'transaction',
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		paid_date: date().notNull(),
		invoice_date: date().notNull(),
		amount: integer().notNull().default(0),
		currency: varchar({ length: 3 }).notNull(),

		subscription_id: uuid()
			.notNull()
			.references(() => subscription.id, { onDelete: 'cascade' }),
		user_id: uuid()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		payment_method_id: uuid().references(() => payment_method.id, {
			onDelete: 'set null',
		}),
	},
	table => ({
		amountConstraint: check('amount', sql`${table.amount} > 0`),
	})
)

export const Transaction = createSelectSchema(transaction)
export const NewTransaction = createInsertSchema(transaction)

export default transaction
