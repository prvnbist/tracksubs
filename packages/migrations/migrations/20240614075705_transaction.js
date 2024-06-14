/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.createTable('transaction', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.date('paid_date').notNullable()
		table.date('invoice_date').notNullable()
		table.integer('amount').notNullable().defaultTo(0).checkPositive()
		table.text('currency').notNullable()

		table.uuid('user_id').notNullable()
		table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')

		table.uuid('subscription_id').notNullable()
		table.foreign('subscription_id').references('id').inTable('subscription').onDelete('CASCADE')

		table.uuid('payment_method_id')
		table
			.foreign('payment_method_id')
			.references('id')
			.inTable('payment_method')
			.onDelete('SET NULL')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => knex.schema.dropTableIfExists('transaction')
