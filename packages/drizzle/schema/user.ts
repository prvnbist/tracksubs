import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import usage from './usage'

const user = pgTable('user', {
	auth_id: text('auth_id').notNull(),
	currency: text('currency'),
	email: text('email').notNull(),
	first_name: text('first_name'),
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	image_url: text('image_url'),
	is_onboarded: boolean('is_onboarded').default(false),
	last_name: text('last_name'),
	plan: text('plan').default('FREE').notNull(),
	timezone: text('timezone'),
	usage_id: uuid('usage_id'),
})

export const userRelations = relations(user, ({ one }) => ({
	usage: one(usage, {
		fields: [user.usage_id],
		references: [usage.id],
	}),
}))

export default user
