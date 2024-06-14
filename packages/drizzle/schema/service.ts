import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

const service = pgTable('service', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	title: text('title').notNull(),
	key: text('key').notNull(),
	website: text('website').notNull(),
})

export default service
