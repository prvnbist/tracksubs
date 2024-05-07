/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.alterTable('subscription', function (t) {
		t.uuid('payment_method_id')
		t.foreign('payment_method_id').references('id').inTable('payment_method')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.alterTable('subscription', function (t) {
		t.dropColumn('payment_method_id')
	})
}
