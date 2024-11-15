import { relations, sql } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import {
	boolean,
	check,
	integer,
	numeric,
	pgTable,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core'

import user from './user'
import subscription from './subscription'

const collaborator = pgTable(
	'collaborator',
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		amount: integer().notNull().default(0),
		percentage: numeric({ precision: 5, scale: 2 }).notNull().default(sql`0.00`),
		subscription_id: uuid()
			.notNull()
			.references(() => subscription.id, { onDelete: 'cascade' }),
		user_id: uuid()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		created_at: timestamp().notNull().defaultNow(),
		email_alert: boolean().default(false).notNull(),
	},
	table => ({
		percentageConstraint: check(
			'percentage',
			sql`${table.percentage} >= 0 AND ${table.percentage} <= 100`
		),
		uniqueConstraint: unique('subscription_id_user_id').on(table.subscription_id, table.user_id),
	})
)

export const collaboratorRelations = relations(collaborator, ({ one }) => ({
	subscription: one(subscription, {
		fields: [collaborator.subscription_id],
		references: [subscription.id],
		relationName: 'collaborator',
	}),
	user: one(user, {
		fields: [collaborator.user_id],
		references: [user.id],
		relationName: 'user',
	}),
}))

export const Collaborator = createSelectSchema(collaborator)
export const NewCollaborator = createInsertSchema(collaborator)

export default collaborator
