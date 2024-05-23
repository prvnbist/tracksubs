/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.withSchema('public').alterTable('transaction', table => {
		table.setNullable('payment_method_id')
		table.dropForeign('payment_method_id')
		table
			.foreign('payment_method_id')
			.references('id')
			.inTable('payment_method')
			.onDelete('SET NULL')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').alterTable('transaction', table => {
		table.dropNullable('payment_method_id')
		table.dropForeign('payment_method_id')
		table
			.foreign('payment_method_id')
			.references('id')
			.inTable('payment_method')
			.onDelete('NO ACTION')
	})
}
