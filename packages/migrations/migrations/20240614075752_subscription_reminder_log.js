/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.createTable('subscription_reminder_log', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.integer('amount').notNullable()
		table.text('currency').notNullable()
		table.date('renewal_date').notNullable()
		table.text('timezone').notNullable()
		table.datetime('executed_at').notNullable()

		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')

		table.uuid('subscription_id').notNullable()
		table.foreign('subscription_id').references('id').inTable('subscription').onDelete('CASCADE')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTableIfExists('subscription_reminder_log')
