CREATE TYPE "public"."blog_post_status" AS ENUM('draft', 'published', 'scheduled', 'archived');--> statement-breakpoint
CREATE TABLE "blog_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" text,
	"icon" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text,
	"parent_id" text,
	"content" text NOT NULL,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post_tag" (
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" jsonb NOT NULL,
	"featured_image" text,
	"author_id" text NOT NULL,
	"category_id" text,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"scheduled_for" timestamp,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"is_featured" boolean DEFAULT false,
	"views_count" integer DEFAULT 0,
	"reading_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_tag_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "pageview_user_date_idx";--> statement-breakpoint
DROP INDEX "pageview_path_date_idx";--> statement-breakpoint
ALTER TABLE "blog_category" ADD CONSTRAINT "blog_category_parent_id_blog_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_parent_id_blog_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tag" ADD CONSTRAINT "blog_post_tag_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tag" ADD CONSTRAINT "blog_post_tag_tag_id_blog_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_category_id_blog_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_category_slug_idx" ON "blog_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_category_parent_idx" ON "blog_category" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "blog_category_active_idx" ON "blog_category" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "blog_comment_post_idx" ON "blog_comment" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "blog_comment_user_idx" ON "blog_comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blog_comment_approved_idx" ON "blog_comment" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "blog_post_tag_post_idx" ON "blog_post_tag" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "blog_post_tag_tag_idx" ON "blog_post_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_post_slug_idx" ON "blog_post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_post_author_idx" ON "blog_post" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blog_post_category_idx" ON "blog_post" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "blog_post_status_idx" ON "blog_post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_post_created_idx" ON "blog_post" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "blog_tag_slug_idx" ON "blog_tag" USING btree ("slug");