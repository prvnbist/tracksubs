/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.schema.withSchema('public').alterTable('payment_method', function (table) {
		table.dropForeign('user_id')
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')
	})
	await knex.schema.withSchema('public').alterTable('transaction', function (table) {
		table.dropForeign('user_id')
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')

		table.dropForeign('subscription_id')
		table.foreign('subscription_id').references('id').inTable('subscription').onDelete('CASCADE')
	})

	return knex.schema.withSchema('public').alterTable('subscription', function (table) {
		table.dropForeign('user_id')
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
	await knex.schema.withSchema('public').alterTable('payment_method', function (table) {
		table.dropForeign('user_id')
		table.foreign('user_id').references('id').inTable('user').onDelete('NO ACTION')
	})
	await knex.schema.withSchema('public').alterTable('transaction', function (table) {
		table.dropForeign('user_id')
		table.foreign('user_id').references('id').inTable('user').onDelete('NO ACTION')

		table.dropForeign('subscription_id')
		table
			.foreign('subscription_id')
			.references('id')
			.inTable('subscription')
			.onDelete('NO ACTION')
	})

	return knex.schema.withSchema('public').alterTable('subscription', function (table) {
		table.dropForeign('user_id')
		table.foreign('user_id').references('id').inTable('user').onDelete('NO ACTION')
	})
}
