import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './schema/*',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.DB_HOST!,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER!,
		database: process.env.DB_NAME!,
		password: process.env.DB_PASS!,
		ssl: true,
	},
})
