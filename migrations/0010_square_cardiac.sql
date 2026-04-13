CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('digital', 'physical', 'course', 'subscription', 'service');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"event" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"category_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tag" (
	"product_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"discount_price" integer,
	"type" "product_type" DEFAULT 'digital' NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"featured_image" text,
	"images" jsonb,
	"metadata" jsonb,
	"stock" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"views_count" integer DEFAULT 0,
	"sales_count" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '0',
	"published_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "auditLogs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "auditLogs" CASCADE;--> statement-breakpoint
DROP INDEX "organization_idx";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "banned" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag" ADD CONSTRAINT "product_tag_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag" ADD CONSTRAINT "product_tag_tag_id_blog_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_event_idx" ON "audit_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_product_category" ON "product_category" USING btree ("product_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_product_tag" ON "product_tag" USING btree ("product_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_idx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_type_idx" ON "product" USING btree ("type");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "product" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_price_idx" ON "product" USING btree ("price");--> statement-breakpoint
CREATE INDEX "product_featured_idx" ON "product" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "product_created_idx" ON "product" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "blog_post_featured_idx" ON "blog_post" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "blog_post_published_idx" ON "blog_post" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "users_created_idx" ON "user" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "organization_idx" ON "user" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banReason";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banExpires";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "lastActiveAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "updatedAt";