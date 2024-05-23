/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.withSchema('public').createTable('payment_method', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.string('title').notNullable()
		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('user')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').dropTableIfExists('payment_method')
}
