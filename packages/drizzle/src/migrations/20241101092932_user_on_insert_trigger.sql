CREATE OR REPLACE FUNCTION user_on_insert_trigger() 
   RETURNS TRIGGER 
   LANGUAGE PLPGSQL
AS $$
BEGIN
   INSERT INTO usage (user_id) VALUES (NEW.id);
   UPDATE "user" SET usage_id = (SELECT id FROM usage WHERE user_id = NEW.id) WHERE id = NEW.id;
   RETURN NEW;
END;
$$;

CREATE TRIGGER user_on_insert_trigger
   AFTER INSERT ON "user"
   FOR EACH ROW
   EXECUTE FUNCTION user_on_insert_trigger();