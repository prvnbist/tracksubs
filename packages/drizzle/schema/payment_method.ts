import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

const payment_method = pgTable('payment_method', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	title: text('title').notNull(),
	user_id: uuid('user_id').notNull(),
})

export default payment_method
