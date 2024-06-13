/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async knex => {
	await knex.raw(`
      CREATE OR REPLACE FUNCTION user_on_insert_trigger() 
         RETURNS TRIGGER 
         LANGUAGE PLPGSQL
      AS $$
      BEGIN
         INSERT INTO usage (user_id) VALUES (NEW.id);
         UPDATE "user" SET usage_id = (SELECT id FROM usage WHERE user_id = NEW.id) WHERE id = NEW.id;
         RETURN NEW;
      END;
      $$
   `)
	return knex.raw(`
      CREATE TRIGGER user_on_insert_trigger
      AFTER INSERT ON "user"
      FOR EACH ROW
      EXECUTE FUNCTION user_on_insert_trigger();
   `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async knex => {
	await knex.raw('DROP TRIGGER IF EXISTS user_on_insert_trigger ON "user";')
	return knex.raw('DROP FUNCTION IF EXISTS user_on_insert_trigger;')
}
