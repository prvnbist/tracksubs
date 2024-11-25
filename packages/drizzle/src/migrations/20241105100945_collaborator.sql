CREATE TABLE IF NOT EXISTS "collaborator" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	"subscription_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_id_user_id" UNIQUE("subscription_id","user_id"),
	CONSTRAINT "percentage" CHECK ("collaborator"."percentage" >= 0 AND "collaborator"."percentage" <= 100)
);
--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "split_strategy" varchar(20);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
