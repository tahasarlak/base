CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'dropped', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"instructorId" text,
	"organizationId" text,
	"price" integer DEFAULT 0,
	"discountPrice" integer,
	"duration" integer,
	"level" text DEFAULT 'beginner',
	"thumbnail" text,
	"isPublished" boolean DEFAULT false,
	"isFree" boolean DEFAULT false,
	"enrollmentsCount" integer DEFAULT 0,
	"completionRate" numeric(5, 2) DEFAULT '0',
	"averageRating" numeric(3, 2) DEFAULT '0',
	"totalRevenue" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"courseId" text NOT NULL,
	"organizationId" text,
	"status" "enrollment_status" DEFAULT 'active',
	"progress" integer DEFAULT 0,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"lastAccessedAt" timestamp,
	"amountPaid" integer DEFAULT 0,
	"paymentStatus" "payment_status" DEFAULT 'pending',
	"paymentId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_view" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"path" text NOT NULL,
	"sessionId" text,
	"duration" integer,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"enrollmentId" text,
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending',
	"provider" text,
	"transactionId" text,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "plan" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "maxUsers" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lastActiveAt" timestamp;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_instructorId_user_id_fk" FOREIGN KEY ("instructorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_view" ADD CONSTRAINT "page_view_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_enrollmentId_enrollment_id_fk" FOREIGN KEY ("enrollmentId") REFERENCES "public"."enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_slug_idx" ON "course" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "course_instructor_idx" ON "course" USING btree ("instructorId");--> statement-breakpoint
CREATE INDEX "course_org_idx" ON "course" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "course_published_idx" ON "course" USING btree ("isPublished");--> statement-breakpoint
CREATE INDEX "course_created_idx" ON "course" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "enrollment_user_idx" ON "enrollment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "enrollment_course_idx" ON "enrollment" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "enrollment_org_idx" ON "enrollment" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "enrollment_status_idx" ON "enrollment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enrollment_payment_status_idx" ON "enrollment" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "enrollment_user_date_idx" ON "enrollment" USING btree ("userId","enrolledAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "enrollment_course_date_idx" ON "enrollment" USING btree ("courseId","enrolledAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "enrollment_org_date_idx" ON "enrollment" USING btree ("organizationId","enrolledAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "enrollment_date_idx" ON "enrollment" USING btree ("enrolledAt");--> statement-breakpoint
CREATE INDEX "pageview_user_idx" ON "page_view" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "pageview_path_idx" ON "page_view" USING btree ("path");--> statement-breakpoint
CREATE INDEX "pageview_session_idx" ON "page_view" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "pageview_created_idx" ON "page_view" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "pageview_user_date_idx" ON "page_view" USING btree ("userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pageview_path_date_idx" ON "page_view" USING btree ("path","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "payment_user_idx" ON "payment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payment_enrollment_idx" ON "payment" USING btree ("enrollmentId");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_paid_at_idx" ON "payment" USING btree ("paidAt");--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_idx" ON "account" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "audit_log" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "org_member_org_idx" ON "organization_member" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "org_member_user_idx" ON "organization_member" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "org_member_composite_idx" ON "organization_member" USING btree ("organizationId","userId");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "owner_idx" ON "organization" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expires_idx" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "organization_idx" ON "user" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "user" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "last_active_idx" ON "user" USING btree ("lastActiveAt");