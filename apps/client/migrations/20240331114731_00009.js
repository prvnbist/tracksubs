/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
	await knex.raw(`ALTER TABLE "user" ALTER COLUMN auth_id TYPE text;`)
	await knex.raw(`ALTER TABLE "user" ALTER COLUMN first_name TYPE text;`)
	await knex.raw(`ALTER TABLE "user" ALTER COLUMN last_name TYPE text;`)
	await knex.raw(`ALTER TABLE "user" ALTER COLUMN email TYPE text;`)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {}
