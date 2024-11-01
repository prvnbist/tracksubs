CREATE TABLE IF NOT EXISTS "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(30) NOT NULL,
	"title" text NOT NULL,
	"website" text,
	CONSTRAINT "service_key_unique" UNIQUE("key")
);
