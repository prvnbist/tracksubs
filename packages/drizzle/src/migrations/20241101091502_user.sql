CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" varchar(80),
	"last_name" varchar(80),
	"timezone" varchar(30),
	"currency" varchar(3),
	"image_url" text,
	"plan" text DEFAULT 'FREE' NOT NULL,
	"is_onboarded" boolean DEFAULT false,
	CONSTRAINT "user_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
