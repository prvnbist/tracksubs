/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.raw(
		'ALTER TABLE subscription ALTER COLUMN next_billing_date TYPE timestamp with time zone;'
	)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.raw('ALTER TABLE subscription ALTER COLUMN next_billing_date TYPE date;')
}
