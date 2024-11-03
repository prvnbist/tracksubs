import { relations, sql } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { check, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'

import user from './user'

const contact = pgTable(
	'contact',
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		sender_id: uuid()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		receiver_id: uuid()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		sent_at: timestamp().notNull().defaultNow(),
		resolved_at: timestamp(),
		status: varchar({ length: 15 }).default('PENDING').notNull(),
	},
	table => ({
		uniqueConstraint: unique('sender_id_receiver_id').on(table.sender_id, table.receiver_id),
		selfRequestConstraint: check(
			'sender_id <> receiver_id',
			sql`${table.sender_id} <> ${table.receiver_id}`
		),
	})
)

export const contactRelations = relations(contact, ({ one }) => ({
	sender: one(user, {
		fields: [contact.sender_id],
		references: [user.id],
		relationName: 'sender',
	}),
	receiver: one(user, {
		fields: [contact.receiver_id],
		references: [user.id],
		relationName: 'receiver',
	}),
}))

export const Contact = createSelectSchema(contact)
export const NewContact = createInsertSchema(contact)

export default contact
