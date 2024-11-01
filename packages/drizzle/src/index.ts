
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

const db = drizzle({
	schema,
	connection: {
		host: process.env.DB_HOST!,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER!,
		password: process.env.DB_PASS!,
		database: process.env.DB_NAME!,
		ssl: process.env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false },
	},
})

export { schema }

export default db
