/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.schema.createTable('usage', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.integer('total_subscriptions').notNullable().defaultTo(0)
		table.integer('total_alerts').notNullable().defaultTo(0)

		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')
	})

	return knex.schema.alterTable('user', table => {
		table.uuid('usage_id')
		table.foreign('usage_id').references('id').inTable('usage')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.schema.alterTable('user', table => {
		table.dropColumn('usage_id')
	})
	return knex.schema.dropTableIfExists('usage')
}
