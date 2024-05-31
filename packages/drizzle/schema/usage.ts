import { integer, pgTable, uuid } from 'drizzle-orm/pg-core'

const usage = pgTable('usage', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	user_id: uuid('user_id').notNull(),
	total_alerts: integer('total_alerts').default(0).notNull(),
	total_subscriptions: integer('total_subscriptions').default(0).notNull(),
})

export default usage
