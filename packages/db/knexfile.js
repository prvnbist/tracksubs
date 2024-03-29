require('dotenv').config()

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	client: 'pg',
	connection: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		database: process.env.DB_NAME,
		password: process.env.DB_PASS,
		ssl: { rejectUnauthorised: false },
	},
	migrations: {
		directory: './migrations',
	},
}
