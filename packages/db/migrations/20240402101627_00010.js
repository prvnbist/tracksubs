/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.withSchema('public').alterTable('subscription', table => {
		table.renameColumn('next_payment_date', 'next_billing_date')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').alterTable('subscription', table => {
		table.renameColumn('next_billing_date', 'next_payment_date')
	})
}
