CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "public"."file_access" AS ENUM('public', 'enrolled', 'group', 'instructor_only');--> statement-breakpoint
CREATE TYPE "public"."grade_type" AS ENUM('assignment', 'quiz', 'midterm', 'final', 'project', 'attendance', 'participation');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('video', 'text', 'quiz', 'assignment', 'file', 'live', 'reading');--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('multiple_choice', 'true_false', 'short_answer', 'essay');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "attendance_status" NOT NULL,
	"date" timestamp NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"certificate_url" text,
	"certificate_number" text,
	CONSTRAINT "certificate_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "course_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_group" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"max_students" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_instructor" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"instructor_id" text NOT NULL,
	"role" text DEFAULT 'co_instructor',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "lesson_type" DEFAULT 'text' NOT NULL,
	"content" jsonb,
	"video_url" text,
	"file_url" text,
	"file_access" "file_access" DEFAULT 'enrolled',
	"duration" integer,
	"order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false,
	"is_free_preview" boolean DEFAULT false,
	"prerequisites" jsonb,
	"estimated_time" integer,
	"difficulty" text DEFAULT 'medium',
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_module" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_quiz" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"quiz_type" "quiz_type" DEFAULT 'multiple_choice',
	"passing_score" integer DEFAULT 70,
	"time_limit" integer,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_review" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text,
	"grade_type" "grade_type" NOT NULL,
	"score" numeric(5, 2) NOT NULL,
	"max_score" numeric(5, 2) DEFAULT '100',
	"feedback" text,
	"graded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_file" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text,
	"file_size" integer,
	"access" "file_access" DEFAULT 'enrolled',
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_instructor" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"instructor_id" text NOT NULL,
	"role" text DEFAULT 'co_instructor',
	"revenue_share_percent" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_class" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"meeting_url" text,
	"meeting_password" text,
	"is_recorded" boolean DEFAULT false,
	"recording_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_question" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text,
	"explanation" text,
	"order" integer DEFAULT 0,
	"points" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "semester" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "semester_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_view" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "audit_log" CASCADE;--> statement-breakpoint
DROP TABLE "page_view" CASCADE;--> statement-breakpoint
DROP TABLE "payment" CASCADE;--> statement-breakpoint
ALTER TABLE "course" DROP CONSTRAINT "course_instructorId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "course" DROP CONSTRAINT "course_organizationId_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_courseId_course_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_organizationId_organization_id_fk";
--> statement-breakpoint
DROP INDEX "course_instructor_idx";--> statement-breakpoint
DROP INDEX "course_org_idx";--> statement-breakpoint
DROP INDEX "course_published_idx";--> statement-breakpoint
DROP INDEX "course_created_idx";--> statement-breakpoint
DROP INDEX "enrollment_user_idx";--> statement-breakpoint
DROP INDEX "enrollment_course_idx";--> statement-breakpoint
DROP INDEX "enrollment_org_idx";--> statement-breakpoint
DROP INDEX "enrollment_status_idx";--> statement-breakpoint
DROP INDEX "enrollment_payment_status_idx";--> statement-breakpoint
DROP INDEX "enrollment_user_date_idx";--> statement-breakpoint
DROP INDEX "enrollment_course_date_idx";--> statement-breakpoint
DROP INDEX "enrollment_org_date_idx";--> statement-breakpoint
DROP INDEX "enrollment_date_idx";--> statement-breakpoint
DROP INDEX "org_member_composite_idx";--> statement-breakpoint
DROP INDEX "created_at_idx";--> statement-breakpoint
DROP INDEX "last_active_idx";--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "semester_id" text;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "main_instructor_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "is_published" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "is_free" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "max_students" integer;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "enrollments_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "average_rating" numeric(3, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "total_revenue" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "prerequisites" jsonb;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "course_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "semester_id" text;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "enrolled_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "last_accessed_at" timestamp;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "amount_paid" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "payment_status" "payment_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "payment_id" text;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_group" ADD CONSTRAINT "course_group_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lesson" ADD CONSTRAINT "course_lesson_module_id_course_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_module" ADD CONSTRAINT "course_module_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_quiz" ADD CONSTRAINT "course_quiz_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_review" ADD CONSTRAINT "course_review_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_review" ADD CONSTRAINT "course_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade" ADD CONSTRAINT "grade_graded_by_user_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_file" ADD CONSTRAINT "lesson_file_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_file" ADD CONSTRAINT "lesson_file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_instructor" ADD CONSTRAINT "lesson_instructor_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_instructor" ADD CONSTRAINT "lesson_instructor_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_class" ADD CONSTRAINT "live_class_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quiz_id_course_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."course_quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_lesson_user_idx" ON "attendance" USING btree ("lesson_id","user_id");--> statement-breakpoint
CREATE INDEX "certificate_user_course_idx" ON "certificate" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_category_slug_idx" ON "course_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "group_course_idx" ON "course_group" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_group_per_course" ON "course_group" USING btree ("course_id","slug");--> statement-breakpoint
CREATE INDEX "course_instructor_course_idx" ON "course_instructor" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lesson_module_idx" ON "course_lesson" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "module_course_idx" ON "course_module" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "quiz_lesson_idx" ON "course_quiz" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "review_course_idx" ON "course_review" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "grade_user_course_idx" ON "grade" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "file_lesson_idx" ON "lesson_file" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_instructor_lesson_idx" ON "lesson_instructor" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_instructor_user_idx" ON "lesson_instructor" USING btree ("instructor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_lesson_instructor" ON "lesson_instructor" USING btree ("lesson_id","instructor_id");--> statement-breakpoint
CREATE INDEX "live_lesson_idx" ON "live_class" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "question_quiz_idx" ON "quiz_question" USING btree ("quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX "semester_slug_idx" ON "semester" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_category_id_course_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_main_instructor_id_user_id_fk" FOREIGN KEY ("main_instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_group_id_course_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."course_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_category_idx" ON "course" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "course_semester_idx" ON "course" USING btree ("semester_id");--> statement-breakpoint
CREATE INDEX "enrollment_user_course_idx" ON "enrollment" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "enrollment_group_idx" ON "enrollment" USING btree ("group_id");--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "instructorId";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "isPublished";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "isFree";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "enrollmentsCount";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "completionRate";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "averageRating";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "totalRevenue";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "courseId";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "organizationId";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "enrolledAt";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "completedAt";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "lastAccessedAt";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "amountPaid";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "paymentStatus";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "paymentId";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "enrollment" DROP COLUMN "updatedAt";