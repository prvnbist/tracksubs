/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.withSchema('public').createTable('user', function (table) {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.string('auth_id').notNullable().unique()
		table.string('first_name')
		table.string('last_name')
		table.string('email').notNullable().unique()
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.withSchema('public').dropTableIfExists('user')
}
