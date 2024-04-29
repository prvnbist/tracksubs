/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.withSchema('public').createTable('waitlist', function (table) {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.string('email').notNullable().unique()
		table.boolean('is_subscribed').defaultTo(true)
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.withSchema('public').dropTableIfExists('waitlist')
}
