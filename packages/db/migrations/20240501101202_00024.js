/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.withSchema('public').createTable('subscription_reminder_log', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.integer('amount').notNullable()
		table.integer('currency').notNullable()
		table.date('renewal_date').notNullable()
		table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE')
		table
			.uuid('subscription_id')
			.notNullable()
			.references('id')
			.inTable('subscription')
			.onDelete('CASCADE')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').dropTableIfExists('subscription_alert_log')
}
