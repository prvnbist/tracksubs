/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.createTable('service', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.text('key').notNullable().unique()
		table.text('title').notNullable()
		table.text('website')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTableIfExists('service')
