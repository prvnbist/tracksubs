/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	return knex.schema.withSchema('public').alterTable('subscription_reminder_log', table => {
		table.string('timezone').notNullable()
		table.datetime('executed_at').notNullable()
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').alterTable('subscription_reminder_log', table => {
		table.dropColumn('timezone')
		table.dropColumn('executed_at')
	})
}
