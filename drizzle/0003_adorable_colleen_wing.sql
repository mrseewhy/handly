CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"reply_id" text,
	"uploader_id" text,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"checksum" text NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_reply_id_ticket_replies_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."ticket_replies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploader_id_user_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_ticket_idx" ON "attachments" USING btree ("ticket_id","created_at");