/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.withSchema('public').alterTable('subscription', function (table) {
		table.renameColumn('next_payment_date', 'next_billing_date')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.withSchema('public').alterTable('subscription', function (table) {
		table.renameColumn('next_billing_date', 'next_payment_date')
	})
}
