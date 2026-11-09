CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"user_id" text,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_messages_created_idx" ON "contact_messages" USING btree ("created_at");