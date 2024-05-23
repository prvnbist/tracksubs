/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
	return knex.schema.withSchema('public').createTable('transaction', table => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.date('paid_date').notNullable()
		table.date('invoice_date').notNullable()
		table.integer('amount').notNullable().checkPositive()
		table.string('currency').notNullable()
		table.uuid('user_id').notNullable()
		table.uuid('payment_method_id').notNullable()
		table.foreign('user_id').references('id').inTable('user')
		table.foreign('payment_method_id').references('id').inTable('payment_method')
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
	return knex.schema.withSchema('public').dropTableIfExists('transaction')
}
