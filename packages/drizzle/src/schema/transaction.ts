import { relations, sql } from 'drizzle-orm'
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { check, date, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

import payment_method from './payment_method'
import subscription from './subscription'
import user from './user'

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

export const transactionRelations = relations(transaction, ({ one }) => ({
	user: one(user, {
		fields: [transaction.user_id],
		references: [user.id],
		relationName: 'user',
	}),
	subscription: one(subscription, {
		fields: [transaction.subscription_id],
		references: [subscription.id],
		relationName: 'transaction',
	}),
	payment_method: one(payment_method, {
		fields: [transaction.payment_method_id],
		references: [payment_method.id],
		relationName: 'payment_method',
	}),
}))

export default transaction
