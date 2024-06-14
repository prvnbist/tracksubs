/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.schema.createTable('payment_method', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.text('title').notNullable()
		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')
	})
	return knex.schema.alterTable('subscription', t => {
		t.uuid('payment_method_id')
		t.foreign('payment_method_id').references('id').inTable('payment_method').onDelete('SET NULL')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.schema.alterTable('subscription', t => {
		t.dropColumn('payment_method_id')
	})
	return knex.schema.dropTableIfExists('payment_method')
}
