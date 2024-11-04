import { relations } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

import subscription from './subscription'

const service = pgTable('service', {
	id: uuid().primaryKey().notNull().defaultRandom(),
	key: varchar({ length: 30 }).notNull().unique(),
	title: text().notNull(),
	website: text(),
})

export const Service = createSelectSchema(service)

export const serviceRelations = relations(service, ({ many }) => ({
	subscriptions: many(subscription, {
		relationName: 'service',
	}),
}))

export default service
