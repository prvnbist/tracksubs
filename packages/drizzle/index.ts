import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import * as schema from './schema'

const client = postgres({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	database: process.env.DB_NAME,
	password: process.env.DB_PASS,
	ssl: { rejectUnauthorized: false },
})

const insertPaymentMethodSchema = createInsertSchema(schema.payment_method)
const selectPaymentMethodSchema = createSelectSchema(schema.payment_method)

const selectServiceSchema = createSelectSchema(schema.service)

const selectSubscriptionSchema = createSelectSchema(schema.subscription)

const selectTransactionSchema = createSelectSchema(schema.transaction)

const selectUsageSchema = createSelectSchema(schema.usage)

const insertUserSchema = createInsertSchema(schema.user)
const selectUserSchema = createSelectSchema(schema.user)

const db = drizzle(client, { schema })

export {
	insertPaymentMethodSchema,
	insertUserSchema,
	schema,
	selectPaymentMethodSchema,
	selectServiceSchema,
	selectSubscriptionSchema,
	selectTransactionSchema,
	selectUsageSchema,
	selectUserSchema,
}

export default db
