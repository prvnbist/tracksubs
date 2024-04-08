module.exports = {
	client: 'pg',
	connection: {
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		database: process.env.DB_NAME,
		password: process.env.DB_PASS,
		ssl: { rejectUnauthorized: false },
	},
	migrations: {
		directory: './migrations',
	},
}
