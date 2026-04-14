CREATE TYPE "public"."dimension_unit" AS ENUM('cm', 'inch', 'm');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock', 'backorder');--> statement-breakpoint
CREATE TYPE "public"."weight_unit" AS ENUM('kg', 'g', 'lb', 'oz');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced', 'all_levels');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('online', 'wallet', 'cash_on_delivery', 'bank_transfer', 'crypto');--> statement-breakpoint
ALTER TYPE "public"."lesson_type" ADD VALUE 'scorm';--> statement-breakpoint
ALTER TYPE "public"."product_status" ADD VALUE 'scheduled' BEFORE 'archived';--> statement-breakpoint
ALTER TYPE "public"."product_status" ADD VALUE 'out_of_stock';--> statement-breakpoint
ALTER TYPE "public"."product_type" ADD VALUE 'bundle';--> statement-breakpoint
ALTER TYPE "public"."product_type" ADD VALUE 'ticket';--> statement-breakpoint
ALTER TYPE "public"."product_type" ADD VALUE 'membership';--> statement-breakpoint
CREATE TABLE "product_category_relation" (
	"product_id" text NOT NULL,
	"category_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_digital_file" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"file_type" text,
	"version" text,
	"is_main_file" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_review" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_shipping_info" (
	"product_id" text PRIMARY KEY NOT NULL,
	"weight" numeric(10, 3),
	"weight_unit" "weight_unit" DEFAULT 'kg',
	"length" numeric(10, 2),
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"dimension_unit" "dimension_unit" DEFAULT 'cm',
	"shipping_class" text
);
--> statement-breakpoint
CREATE TABLE "product_specification" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"group" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_tag_relation" (
	"product_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"sku" text,
	"price" integer,
	"discount_price" integer,
	"stock" integer DEFAULT 0,
	"attributes" jsonb,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"variant_id" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_at_purchase" integer NOT NULL,
	"discount_price_at_purchase" integer,
	"product_title" text NOT NULL,
	"variant_attributes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" integer NOT NULL,
	"discount_amount" integer DEFAULT 0,
	"final_amount" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"payment_id" text,
	"transaction_id" text,
	"shipping_address" jsonb,
	"tracking_code" text,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"event" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendance" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "certificate" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "course_group" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "course_quiz" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "grade" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lesson_file" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lesson_instructor" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "live_class" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_tag" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quiz_question" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verificationToken" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "attendance" CASCADE;--> statement-breakpoint
DROP TABLE "audit_logs" CASCADE;--> statement-breakpoint
DROP TABLE "certificate" CASCADE;--> statement-breakpoint
DROP TABLE "course_group" CASCADE;--> statement-breakpoint
DROP TABLE "course_quiz" CASCADE;--> statement-breakpoint
DROP TABLE "grade" CASCADE;--> statement-breakpoint
DROP TABLE "lesson_file" CASCADE;--> statement-breakpoint
DROP TABLE "lesson_instructor" CASCADE;--> statement-breakpoint
DROP TABLE "live_class" CASCADE;--> statement-breakpoint
DROP TABLE "product_tag" CASCADE;--> statement-breakpoint
DROP TABLE "quiz_question" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "verificationToken" CASCADE;--> statement-breakpoint
ALTER TABLE "course" DROP CONSTRAINT "course_category_id_course_category_id_fk";
--> statement-breakpoint
ALTER TABLE "course" DROP CONSTRAINT "course_semester_id_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "course" DROP CONSTRAINT "course_main_instructor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_group_id_course_group_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_semester_id_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "organization_member" DROP CONSTRAINT "organization_member_organizationId_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "organization_member" DROP CONSTRAINT "organization_member_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "organization" DROP CONSTRAINT "organization_ownerId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_product_id_product_id_fk";
--> statement-breakpoint
DROP INDEX "blog_post_tag_post_idx";--> statement-breakpoint
DROP INDEX "blog_post_tag_tag_idx";--> statement-breakpoint
DROP INDEX "course_instructor_course_idx";--> statement-breakpoint
DROP INDEX "review_course_idx";--> statement-breakpoint
DROP INDEX "course_semester_idx";--> statement-breakpoint
DROP INDEX "enrollment_group_idx";--> statement-breakpoint
DROP INDEX "slug_idx";--> statement-breakpoint
DROP INDEX "owner_idx";--> statement-breakpoint
DROP INDEX "unique_product_category";--> statement-breakpoint
DROP INDEX "product_price_idx";--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
DROP INDEX "role_idx";--> statement-breakpoint
DROP INDEX "organization_idx";--> statement-breakpoint
DROP INDEX "users_created_idx";--> statement-breakpoint
DROP INDEX "org_member_org_idx";--> statement-breakpoint
DROP INDEX "org_member_user_idx";--> statement-breakpoint
ALTER TABLE "course_lesson" ALTER COLUMN "type" SET DEFAULT 'video';--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "level" SET DEFAULT 'beginner'::"public"."course_level";--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "level" SET DATA TYPE "public"."course_level" USING "level"::"public"."course_level";--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "average_rating" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "images" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "average_rating" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "blog_category" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "blog_category" ADD COLUMN "order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "course_category" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "course_category" ADD COLUMN "order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "course_category" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "course_category" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD COLUMN "revenue_share_percent" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "course_review" ADD COLUMN "is_approved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "discount_price" integer;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "compare_at_price" integer;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "language" text DEFAULT 'fa';--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "what_you_will_learn" jsonb;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "requirements" jsonb;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization_member" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_member" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_member" ADD COLUMN "joined_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "max_users" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_category" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "compare_at_price" integer;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "currency" text DEFAULT 'IRR' NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "barcode" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "stock_status" "stock_status" DEFAULT 'in_stock';--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "low_stock_threshold" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "allow_backorder" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "seo_keywords" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "is_visible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "scheduled_for" timestamp;--> statement-breakpoint
ALTER TABLE "semester" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_category_relation" ADD CONSTRAINT "product_category_relation_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category_relation" ADD CONSTRAINT "product_category_relation_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_digital_file" ADD CONSTRAINT "product_digital_file_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_shipping_info" ADD CONSTRAINT "product_shipping_info_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specification" ADD CONSTRAINT "product_specification_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag_relation" ADD CONSTRAINT "product_tag_relation_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tag_relation" ADD CONSTRAINT "product_tag_relation_tag_id_blog_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_product_category" ON "product_category_relation" USING btree ("product_id","category_id");--> statement-breakpoint
CREATE INDEX "digital_file_product_idx" ON "product_digital_file" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "review_product_idx" ON "product_review" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "product_review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shipping_product_idx" ON "product_shipping_info" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "spec_product_idx" ON "product_specification" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_product_tag" ON "product_tag_relation" USING btree ("product_id","tag_id");--> statement-breakpoint
CREATE INDEX "variant_product_idx" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variant_sku_idx" ON "product_variant" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_product_idx" ON "order_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_created_idx" ON "order" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_event_idx" ON "audit_log" USING btree ("event");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "course_category" ADD CONSTRAINT "course_category_parent_id_course_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_category_id_course_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_main_instructor_id_user_id_fk" FOREIGN KEY ("main_instructor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_id_product_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_blog_post_tag" ON "blog_post_tag" USING btree ("post_id","tag_id");--> statement-breakpoint
CREATE INDEX "course_category_parent_idx" ON "course_category" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_course_instructor" ON "course_instructor" USING btree ("course_id","instructor_id");--> statement-breakpoint
CREATE INDEX "course_review_course_idx" ON "course_review" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_review_user_idx" ON "course_review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_instructor_idx" ON "course" USING btree ("main_instructor_id");--> statement-breakpoint
CREATE INDEX "course_published_idx" ON "course" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "course_featured_idx" ON "course" USING btree ("is_featured");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_org_member" ON "organization_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "org_owner_idx" ON "organization" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_category_slug_idx" ON "product_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_category_parent_idx" ON "product_category" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_sku_idx" ON "product" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_created_idx" ON "user" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_last_active_idx" ON "user" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "org_member_org_idx" ON "organization_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_member_user_idx" ON "organization_member" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "course_lesson" DROP COLUMN "file_url";--> statement-breakpoint
ALTER TABLE "course_lesson" DROP COLUMN "file_access";--> statement-breakpoint
ALTER TABLE "course_lesson" DROP COLUMN "prerequisites";--> statement-breakpoint
ALTER TABLE "course_lesson" DROP COLUMN "difficulty";--> statement-breakpoint
ALTER TABLE "course_lesson" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "discountPrice";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "group_id";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "semester_id";--> statement-breakpoint
ALTER TABLE "organization_member" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "organization_member" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "organization_member" DROP COLUMN "joinedAt";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "ownerId";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "maxUsers";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "product_category" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "product_category" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banReason";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banExpires";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "lastActiveAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_sku_unique" UNIQUE("sku");--> statement-breakpoint
DROP TYPE "public"."file_access";--> statement-breakpoint
DROP TYPE "public"."grade_type";--> statement-breakpoint
DROP TYPE "public"."quiz_type";