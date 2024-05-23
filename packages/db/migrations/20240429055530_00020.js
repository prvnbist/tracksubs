/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.schema.withSchema('public').createTable('usage', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.integer('total_subscriptions').notNullable().defaultTo(0)
		table.integer('total_alerts').notNullable().defaultTo(0)
		table.uuid('user_id').references('id').inTable('user').onDelete('CASCADE')
	})
	return knex.schema.withSchema('public').alterTable('user', table => {
		table.uuid('usage_id').references('id').inTable('usage')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.schema.withSchema('public').dropTableIfExists('usage')
	return knex.schema.withSchema('public').alterTable('user', table => {
		table.dropColumn('usage_id')
	})
}
