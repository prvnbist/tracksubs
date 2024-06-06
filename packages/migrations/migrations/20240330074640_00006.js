/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.alterTable('subscription', t => {
		t.uuid('payment_method_id')
		t.foreign('payment_method_id').references('id').inTable('payment_method')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.alterTable('subscription', t => {
		t.dropColumn('payment_method_id')
	})
}
