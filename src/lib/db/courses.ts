// schema/courses.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ==================== ENUMS ====================
export const courseLevelEnum = pgEnum('course_level', [
  'beginner',
  'intermediate',
  'advanced',
  'all_levels',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'active',
  'completed',
  'dropped',
  'expired',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
]);

export const lessonTypeEnum = pgEnum('lesson_type', [
  'video',
  'text',
  'quiz',
  'assignment',
  'file',
  'live',
  'reading',
  'scorm',
]);

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'excused',
]);

// ==================== COURSE CATEGORIES ====================
export const courseCategories = pgTable('course_category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  icon: text('icon'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),
  parentId: text('parent_id').references((): AnyPgColumn => courseCategories.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('course_category_slug_idx').on(table.slug),
  index('course_category_parent_idx').on(table.parentId),
]);

// ==================== SEMESTERS ====================
export const semesters = pgTable('semester', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('semester_slug_idx').on(table.slug),
]);

// ==================== MAIN COURSES TABLE ====================
export const courses = pgTable('course', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  shortDescription: text('short_description'),

  categoryId: text('category_id').references(() => courseCategories.id, { onDelete: 'set null' }),
  semesterId: text('semester_id').references(() => semesters.id, { onDelete: 'set null' }),

  mainInstructorId: text('main_instructor_id').references(() => users.id, { onDelete: 'set null' }).notNull(),

  price: integer('price').default(0).notNull(),
  discountPrice: integer('discount_price'),
  compareAtPrice: integer('compare_at_price'),

  duration: integer('duration'),           // مجموع ساعت دوره
  level: courseLevelEnum('level').default('beginner'),
  language: text('language').default('fa'),

  thumbnail: text('thumbnail'),
  featuredImage: text('featured_image'),
  images: jsonb('images').$type<string[]>().default([]),

  isPublished: boolean('is_published').default(false),
  isFree: boolean('is_free').default(false),
  isFeatured: boolean('is_featured').default(false),

  maxStudents: integer('max_students'),
  enrollmentsCount: integer('enrollments_count').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').default(0),
  totalRevenue: integer('total_revenue').default(0),

  prerequisites: jsonb('prerequisites').$type<string[]>(),
  whatYouWillLearn: jsonb('what_you_will_learn').$type<string[]>(),
  requirements: jsonb('requirements').$type<string[]>(),

  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
}, (table) => [
  uniqueIndex('course_slug_idx').on(table.slug),
  index('course_category_idx').on(table.categoryId),
  index('course_instructor_idx').on(table.mainInstructorId),
  index('course_published_idx').on(table.isPublished),
  index('course_featured_idx').on(table.isFeatured),
]);

// ==================== COURSE INSTRUCTORS (چند استاد) ====================
export const courseInstructors = pgTable('course_instructor', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  instructorId: text('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('co_instructor'), // main, co_instructor, assistant
  revenueSharePercent: decimal('revenue_share_percent', { precision: 5, scale: 2 }).default('0'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_course_instructor').on(table.courseId, table.instructorId),
]);

// ==================== COURSE MODULES ====================
export const courseModules = pgTable('course_module', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('module_course_idx').on(table.courseId),
]);

// ==================== COURSE LESSONS ====================

// درس‌ها
export const courseLessons = pgTable('course_lesson', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  moduleId: text('module_id').references(() => courseModules.id, { onDelete: 'cascade' }).notNull(),

  title: text('title').notNull(),
  description: text('description'),
  type: lessonTypeEnum('type').default('video').notNull(),

  content: jsonb('content'),
  videoUrl: text('video_url'),
  duration: integer('duration'),

  isPublished: boolean('is_published').default(false),
  isFreePreview: boolean('is_free_preview').default(false),

  order: integer('order').notNull().default(0),
  estimatedTime: integer('estimated_time'),

  // فیلدهای جدید
  difficulty: text('difficulty').default('medium'),           // beginner | medium | advanced
  tags: jsonb('tags').$type<string[] | null>(),               // آرایه تگ‌ها

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('lesson_module_idx').on(table.moduleId),
]);
// ==================== ENROLLMENTS ====================
export const enrollments = pgTable('enrollment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  status: enrollmentStatusEnum('status').default('active'),
  progress: integer('progress').default(0), // درصد پیشرفت

  lastAccessedAt: timestamp('last_accessed_at'),
  amountPaid: integer('amount_paid').default(0),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paymentId: text('payment_id'),

  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('enrollment_user_course_idx').on(table.userId, table.courseId),
]);

// ==================== COURSE REVIEWS ====================
export const courseReviews = pgTable('course_review', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1 تا 5
  comment: text('comment'),
  isApproved: boolean('is_approved').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('course_review_course_idx').on(table.courseId),
  index('course_review_user_idx').on(table.userId),
]);

// ==================== RELATIONS ====================
export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(courseCategories),
  semester: one(semesters),
  mainInstructor: one(users),
  instructors: many(courseInstructors),
  modules: many(courseModules),
  enrollments: many(enrollments),
  reviews: many(courseReviews),
}));

export const courseInstructorsRelations = relations(courseInstructors, ({ one }) => ({
  course: one(courses),
  instructor: one(users),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses),
  lessons: many(courseLessons),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one }) => ({
  module: one(courseModules),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users),
  course: one(courses),
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
  course: one(courses),
  user: one(users),
}));