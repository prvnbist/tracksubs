/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.createTable('subscription', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.text('title').notNullable()
		table.text('website')
		table.text('currency').notNullable()
		table.integer('amount').notNullable().checkPositive()
		table.timestamp('next_billing_date', { useTz: true }).notNullable()
		table.text('interval').defaultTo('MONTHLY')
		table.boolean('email_alert').defaultTo(false)
		table.boolean('is_active').defaultTo(true)

		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')

		table.string('service')
		table.foreign('service').references('key').inTable('service')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTableIfExists('subscription')
