/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema
		.withSchema('public')
		.alterTable('subscription_reminder_log', function (table) {
			table.string('timezone').notNullable()
			table.datetime('executed_at').notNullable()
		})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema
		.withSchema('public')
		.alterTable('subscription_reminder_log', function (table) {
			table.dropColumn('timezone')
			table.dropColumn('executed_at')
		})
}
