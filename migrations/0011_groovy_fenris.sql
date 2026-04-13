DROP INDEX "organization_idx";--> statement-breakpoint
DROP INDEX "users_created_idx";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emailVerified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banReason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banExpires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "organizationId" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lastActiveAt" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "organization_idx" ON "user" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "users_created_idx" ON "user" USING btree ("createdAt" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ban_reason";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "ban_expires";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_active_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "updated_at";