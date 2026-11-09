CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE TYPE "public"."activity_kind" AS ENUM('ticket_created', 'reply', 'status_change', 'assignment', 'admin', 'auth', 'user_admin');--> statement-breakpoint
CREATE TYPE "public"."notification_tone" AS ENUM('info', 'success', 'warning', 'danger');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('billing', 'technical', 'account', 'bug', 'feature_request', 'other');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('urgent', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."ticket_reply_kind" AS ENUM('customer', 'agent', 'internal_note', 'system');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'pending', 'on_hold', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "auth"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_name" text NOT NULL,
	"kind" "activity_kind" NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"href" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"href" text NOT NULL,
	"tone" "notification_tone" DEFAULT 'info' NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "ticket_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"author_id" text,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"kind" "ticket_reply_kind" NOT NULL,
	"body" text,
	"event" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "tickets_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"category" "ticket_category" DEFAULT 'other' NOT NULL,
	"creator_id" text NOT NULL,
	"creator_name" text NOT NULL,
	"creator_email" text NOT NULL,
	"assignee_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_response_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"sla_deadline" timestamp with time zone NOT NULL,
	"preview" text DEFAULT '' NOT NULL,
	"unread_for_customer" boolean DEFAULT false NOT NULL,
	"unread_for_admin" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "auth"."account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_log_created_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "auth"."session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_replies_ticket_idx" ON "ticket_replies" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_number_unique" ON "tickets" USING btree ("number");--> statement-breakpoint
CREATE INDEX "tickets_creator_idx" ON "tickets" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "tickets_assignee_idx" ON "tickets" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_updated_idx" ON "tickets" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "auth"."verification" USING btree ("identifier");