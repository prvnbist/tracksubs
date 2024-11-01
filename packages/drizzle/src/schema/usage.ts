import { createSelectSchema } from 'drizzle-zod'
import { integer, pgTable, uuid } from 'drizzle-orm/pg-core'

import user from './user'

const usage = pgTable('usage', {
	id: uuid().primaryKey().notNull().defaultRandom(),
	total_subscriptions: integer().notNull().default(0),
	total_alerts: integer().notNull().default(0),
	user_id: uuid()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})

export const Usage = createSelectSchema(usage)

export default usage
