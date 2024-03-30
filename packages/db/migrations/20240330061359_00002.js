/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.withSchema('public').createTable('subscription', function (table) {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.string('title').notNullable()
		table.string('website')
		table.integer('amount').notNullable().checkPositive()
		table.uuid('user_id').notNullable()
		table.string('currency').notNullable()
		table.date('next_payment_date').notNullable()
		table.string('interval').defaultTo('MONTH')
		table.integer('frequency').notNullable().defaultTo(1)
		table.boolean('email_alert').defaultTo(false)
		table.foreign('user_id').references('id').inTable('user')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.withSchema('public').dropTableIfExists('subscription')
}
