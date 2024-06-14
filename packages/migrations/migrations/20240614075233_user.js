/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex =>
	knex.schema.createTable('user', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.text('auth_id').notNullable().unique()
		table.text('email').notNullable().unique()
		table.text('first_name')
		table.text('last_name')
		table.text('timezone')
		table.text('currency')
		table.text('image_url')
		table.text('plan').defaultTo('FREE')
		table.boolean('is_onboarded').defaultTo(false)
	})

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTableIfExists('user')
