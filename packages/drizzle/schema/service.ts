import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

const service = pgTable('service', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	title: text('title').notNull(),
	key: varchar('key', { length: 255 }).notNull(),
	website: varchar('website', { length: 255 }).notNull(),
})

export default service
