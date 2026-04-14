ALTER TABLE "audit_log" ADD COLUMN "old_value" jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "new_value" jsonb;