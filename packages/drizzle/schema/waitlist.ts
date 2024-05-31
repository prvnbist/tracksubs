import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

const waitlist = pgTable('waitlist', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull(),
	is_subscribed: boolean('is_subscribed').default(true),
})

export default waitlist
