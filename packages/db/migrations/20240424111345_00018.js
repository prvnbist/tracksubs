/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.withSchema('public').alterTable('transaction', function (table) {
		table.uuid('subscription_id').notNullable()
		table.foreign('subscription_id').references('id').inTable('subscription')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {}
