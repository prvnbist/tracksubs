/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.raw(`ALTER TABLE subscription ALTER COLUMN title TYPE text;`)
	await knex.raw(`ALTER TABLE subscription ALTER COLUMN website TYPE text;`)
	await knex.raw(`ALTER TABLE subscription ALTER COLUMN currency TYPE text;`)
	await knex.raw(`ALTER TABLE subscription ALTER COLUMN interval TYPE text;`)

	await knex.raw(`ALTER TABLE payment_method ALTER COLUMN title TYPE text;`)

	await knex.raw(`ALTER TABLE transaction ALTER COLUMN currency TYPE text;`)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {}
