/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.withSchema('public').createTable('service', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.string('key').notNullable().unique()
		table.string('title').notNullable()
		table.string('website')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').dropTableIfExists('service')
}
