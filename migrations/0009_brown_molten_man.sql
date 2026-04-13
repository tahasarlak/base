CREATE TABLE "auditLogs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"event" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auditLogs" ADD CONSTRAINT "auditLogs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "auditLogs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_event_idx" ON "auditLogs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "auditLogs" USING btree ("created_at" DESC NULLS LAST);