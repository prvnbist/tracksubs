import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/schema',
	out: './src/migrations',
	breakpoints: true,
	strict: true,
	verbose: true,
	migrations: {
		prefix: 'timestamp',
		schema: 'public',
		table: '__drizzle_migrations__',
	},
	dbCredentials: {
		host: process.env.DB_HOST!,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER!,
		password: process.env.DB_PASS!,
		database: process.env.DB_NAME!,
		ssl: process.env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false },
	},
})
