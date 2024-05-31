/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.alterTable('transaction', t => {
		t.setNullable('payment_method_id')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.alterTable('transaction', t => {
		t.dropNullable('payment_method_id')
	})
}
