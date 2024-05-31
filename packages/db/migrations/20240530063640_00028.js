/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.raw('ALTER TABLE "user" ALTER COLUMN image_url TYPE text;')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.raw('ALTER TABLE "user" ALTER COLUMN image_url TYPE varchar(255);')
}
