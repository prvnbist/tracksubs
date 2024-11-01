import { createSelectSchema } from 'drizzle-zod'
import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

const service = pgTable('service', {
	id: uuid().primaryKey().notNull().defaultRandom(),
	key: varchar({ length: 30 }).notNull().unique(),
	title: text().notNull(),
	website: text(),
})

export const Service = createSelectSchema(service)

export default service

