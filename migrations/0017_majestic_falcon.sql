CREATE TYPE "public"."file_access" AS ENUM('public', 'private', 'authenticated', 'enrolled', 'instructor_only');--> statement-breakpoint
ALTER TYPE "public"."file_type" ADD VALUE 'pdf' BEFORE 'other';--> statement-breakpoint
ALTER TABLE "file_upload" ALTER COLUMN "mime_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "file_upload" ALTER COLUMN "file_size" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "file_upload" ADD COLUMN "original_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "file_upload" ADD COLUMN "access" "file_access" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "file_upload" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "file_upload" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "file_upload" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "file_type_idx" ON "file_upload" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "file_access_idx" ON "file_upload" USING btree ("access");--> statement-breakpoint
CREATE INDEX "file_created_idx" ON "file_upload" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "file_upload" DROP COLUMN "is_public";