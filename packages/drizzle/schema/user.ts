import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

import usage from './usage'

const user = pgTable('user', {
	auth_id: text('auth_id').notNull(),
	currency: varchar('currency', { length: 225 }),
	email: text('email').notNull(),
	first_name: text('first_name'),
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	image_url: text('image_url'),
	is_onboarded: boolean('is_onboarded').default(false),
	last_name: text('last_name'),
	plan: varchar('plan', { length: 225 }).default('FREE').notNull(),
	timezone: varchar('timezone', { length: 225 }),
	usage_id: uuid('usage_id').notNull(),
})

export const userRelations = relations(user, ({ one }) => ({
	usage: one(usage, {
		fields: [user.usage_id],
		references: [usage.id],
	}),
}))

export default user
