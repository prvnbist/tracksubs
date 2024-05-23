/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.alterTable('subscription', t => {
		t.string('interval').defaultTo('MONTHLY').alter()
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {}
