import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { boolean, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

import usage from './usage'
import payment_method from './payment_method'

const user = pgTable('user', {
	id: uuid().primaryKey().notNull().defaultRandom(),
	auth_id: text().notNull().unique(),
	email: text().notNull().unique(),
	first_name: varchar({ length: 80 }),
	last_name: varchar({ length: 80 }),
	timezone: varchar({ length: 30 }),
	currency: varchar({ length: 3 }),
	image_url: text(),
	plan: text().default('FREE').notNull(),
	is_onboarded: boolean().default(false),
	usage_id: uuid(),
})

export const userRelations = relations(user, ({ one, many }) => ({
	usage: one(usage, {
		fields: [user.id],
		references: [usage.user_id],
	}),
	payment_methods: many(payment_method),
}))

export const User = createSelectSchema(user)
export const NewUser = createInsertSchema(user)

export default user
