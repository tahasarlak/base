import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  integer,
  decimal,
  jsonb,
  index,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================
export const userRoleEnum = pgEnum('user_role', [
  'super_admin', 'admin', 'instructor', 'seller', 'blogger', 'support', 'student', 'customer', 'user',
]);
export const productTypeEnum = pgEnum('product_type', ['digital', 'physical', 'course', 'subscription', 'service']);
export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'completed', 'dropped', 'expired']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'scheduled', 'archived']);

export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'text', 'quiz', 'assignment', 'file', 'live', 'reading']);
export const fileAccessEnum = pgEnum('file_access', ['public', 'enrolled', 'group', 'instructor_only']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'excused']);
export const quizTypeEnum = pgEnum('quiz_type', ['multiple_choice', 'true_false', 'short_answer', 'essay']);
export const gradeTypeEnum = pgEnum('grade_type', ['assignment', 'quiz', 'midterm', 'final', 'project', 'attendance', 'participation']);

// ==================== TABLES ====================
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  event: text('event').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_user_idx').on(table.userId),
  index('audit_event_idx').on(table.event),
  index('audit_created_idx').on(table.createdAt.desc()),
]);
// کاربران
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: boolean('emailVerified').default(false),           // ← مثل قبل
  image: text('image'),
  role: userRoleEnum('role').default('user').notNull(),
  banned: boolean('banned').default(false),
  banReason: text('banReason'),                                     // ← مثل قبل
  banExpires: timestamp('banExpires'),
  organizationId: text('organizationId'),                           // ← مثل قبل
  bio: text('bio'),
  phone: text('phone'),
  location: text('location'),
  website: text('website'),
  lastActiveAt: timestamp('lastActiveAt'),                          // ← مثل قبل
  deletedAt: timestamp('deletedAt'),                                // جدید
  createdAt: timestamp('createdAt').defaultNow().notNull(),         // مثل قبل
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),         // مثل قبل
}, (table) => [
  uniqueIndex('email_idx').on(table.email),
  index('role_idx').on(table.role),
  index('organization_idx').on(table.organizationId),
  index('users_created_idx').on(table.createdAt.desc()),
]);

// سازمان‌ها
export const organizations = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  ownerId: text('ownerId').references(() => users.id).notNull(),
  logo: text('logo'),
  plan: text('plan').default('free'),
  maxUsers: integer('maxUsers').default(10),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('slug_idx').on(table.slug),
  index('owner_idx').on(table.ownerId),
]);

// عضویت در سازمان
export const organizationMembers = pgTable('organization_member', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('member').notNull(),
  joinedAt: timestamp('joinedAt').defaultNow().notNull(),
}, (table) => [
  index('org_member_org_idx').on(table.organizationId),
  index('org_member_user_idx').on(table.userId),
]);
export const products = pgTable('product', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: integer('price').default(0).notNull(),
  discountPrice: integer('discount_price'),
  type: productTypeEnum('type').default('digital').notNull(),
  status: productStatusEnum('status').default('draft').notNull(),
  featuredImage: text('featured_image'),
  images: jsonb('images'),
  metadata: jsonb('metadata'),
  stock: integer('stock').default(0),
  isFeatured: boolean('is_featured').default(false),
  viewsCount: integer('views_count').default(0),
  salesCount: integer('sales_count').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_slug_idx').on(table.slug),
  index('product_type_idx').on(table.type),
  index('product_status_idx').on(table.status),
  index('product_price_idx').on(table.price),
  index('product_featured_idx').on(table.isFeatured),
  index('product_created_idx').on(table.createdAt.desc()),
]);

export const productCategories = pgTable('product_category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  categoryId: text('category_id').notNull(),
}, (table) => [
  uniqueIndex('unique_product_category').on(table.productId, table.categoryId),
]);

export const productTags = pgTable('product_tag', {
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  tagId: text('tag_id').references(() => blogTags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  uniqueIndex('unique_product_tag').on(table.productId, table.tagId),
]);
// احراز هویت
export const accounts = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  password: text('password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  tokenType: text('token_type'),
  sessionState: text('session_state'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('account_user_idx').on(table.userId),
  index('account_provider_idx').on(table.providerId),
]);

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('session_user_idx').on(table.userId),
  index('session_expires_idx').on(table.expiresAt),
]);

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// ==================== BLOG ====================
export const blogCategories = pgTable('blog_category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  parentId: text('parent_id').references((): AnyPgColumn => blogCategories.id, { onDelete: 'set null' }),
  icon: text('icon'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('blog_category_slug_idx').on(table.slug),
  index('blog_category_parent_idx').on(table.parentId),
  index('blog_category_active_idx').on(table.isActive),
]);

export const blogTags = pgTable('blog_tag', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('blog_tag_slug_idx').on(table.slug),
]);

export const blogPosts = pgTable('blog_post', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: jsonb('content').notNull(),               // Tiptap JSON
  featuredImage: text('featured_image'),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  categoryId: text('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  status: blogPostStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at'),
  scheduledFor: timestamp('scheduled_for'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  isFeatured: boolean('is_featured').default(false),
  viewsCount: integer('views_count').default(0),
  readingTime: integer('reading_time'),
  deletedAt: timestamp('deleted_at'),                // soft delete
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('blog_post_slug_idx').on(table.slug),
  index('blog_post_author_idx').on(table.authorId),
  index('blog_post_category_idx').on(table.categoryId),
  index('blog_post_status_idx').on(table.status),
  index('blog_post_featured_idx').on(table.isFeatured),
  index('blog_post_created_idx').on(table.createdAt.desc()),
  index('blog_post_published_idx').on(table.publishedAt),
]);

export const blogPostTags = pgTable('blog_post_tag', {
  postId: text('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  tagId: text('tag_id').references(() => blogTags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  index('blog_post_tag_post_idx').on(table.postId),
  index('blog_post_tag_tag_idx').on(table.tagId),
]);

export const blogComments = pgTable('blog_comment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  parentId: text('parent_id').references((): AnyPgColumn => blogComments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('blog_comment_post_idx').on(table.postId),
  index('blog_comment_user_idx').on(table.userId),
  index('blog_comment_approved_idx').on(table.isApproved),
]);

// ==================== UNIVERSITY SYSTEM ====================

// دسته‌بندی دوره‌ها
export const courseCategories = pgTable('course_category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  icon: text('icon'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('course_category_slug_idx').on(table.slug),
]);

// ترم تحصیلی
export const semesters = pgTable('semester', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('semester_slug_idx').on(table.slug),
]);

// دوره‌های آموزشی
export const courses = pgTable('course', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => courseCategories.id),
  semesterId: text('semester_id').references(() => semesters.id),
  mainInstructorId: text('main_instructor_id').references(() => users.id).notNull(),
  price: integer('price').default(0),
  discountPrice: integer('discountPrice'),
  duration: integer('duration'),
  level: text('level').default('beginner'),
  thumbnail: text('thumbnail'),
  isPublished: boolean('is_published').default(false),
  isFree: boolean('is_free').default(false),
  maxStudents: integer('max_students'),
  enrollmentsCount: integer('enrollments_count').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  totalRevenue: integer('total_revenue').default(0),
  prerequisites: jsonb('prerequisites'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('course_slug_idx').on(table.slug),
  index('course_category_idx').on(table.categoryId),
  index('course_semester_idx').on(table.semesterId),
]);

// استادهای کمکی دوره
export const courseInstructors = pgTable('course_instructor', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  instructorId: text('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('co_instructor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('course_instructor_course_idx').on(table.courseId),
]);

// گروه‌های دانشجویی
export const courseGroups = pgTable('course_group', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  maxStudents: integer('max_students'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('group_course_idx').on(table.courseId),
  uniqueIndex('unique_group_per_course').on(table.courseId, table.slug),
]);

// ثبت‌نام دانشجو
export const enrollments = pgTable('enrollment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  groupId: text('group_id').references(() => courseGroups.id),
  semesterId: text('semester_id').references(() => semesters.id),
  status: enrollmentStatusEnum('status').default('active'),
  progress: integer('progress').default(0),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  amountPaid: integer('amount_paid').default(0),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paymentId: text('payment_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('enrollment_user_course_idx').on(table.userId, table.courseId),
  index('enrollment_group_idx').on(table.groupId),
]);

// ماژول‌ها
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

// درس‌ها
export const courseLessons = pgTable('course_lesson', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  moduleId: text('module_id').references(() => courseModules.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: lessonTypeEnum('type').default('text').notNull(),
  content: jsonb('content'),
  videoUrl: text('video_url'),
  fileUrl: text('file_url'),
  fileAccess: fileAccessEnum('file_access').default('enrolled'),
  duration: integer('duration'),
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').default(false),
  isFreePreview: boolean('is_free_preview').default(false),
  prerequisites: jsonb('prerequisites'),
  estimatedTime: integer('estimated_time'),
  difficulty: text('difficulty').default('medium'),
  tags: jsonb('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('lesson_module_idx').on(table.moduleId),
]);

// استادهای درس + درصد درآمد
export const lessonInstructors = pgTable('lesson_instructor', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  lessonId: text('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  instructorId: text('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('co_instructor'),
  revenueSharePercent: decimal('revenue_share_percent', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('lesson_instructor_lesson_idx').on(table.lessonId),
  index('lesson_instructor_user_idx').on(table.instructorId),
  uniqueIndex('unique_lesson_instructor').on(table.lessonId, table.instructorId),
]);

// جلسات کلاس آنلاین زنده
export const liveClasses = pgTable('live_class', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  lessonId: text('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  meetingUrl: text('meeting_url'),
  meetingPassword: text('meeting_password'),
  isRecorded: boolean('is_recorded').default(false),
  recordingUrl: text('recording_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('live_lesson_idx').on(table.lessonId),
]);

// فایل‌های آموزشی
export const lessonFiles = pgTable('lesson_file', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  lessonId: text('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  access: fileAccessEnum('access').default('enrolled'),
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('file_lesson_idx').on(table.lessonId),
]);

// حضور و غیاب
export const attendance = pgTable('attendance', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  lessonId: text('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: attendanceStatusEnum('status').notNull(),
  date: timestamp('date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('attendance_lesson_user_idx').on(table.lessonId, table.userId),
]);

// کوئیزها
export const courseQuizzes = pgTable('course_quiz', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  lessonId: text('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  quizType: quizTypeEnum('quiz_type').default('multiple_choice'),
  passingScore: integer('passing_score').default(70),
  timeLimit: integer('time_limit'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('quiz_lesson_idx').on(table.lessonId),
]);

// سوالات کوئیز
export const quizQuestions = pgTable('quiz_question', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text('quiz_id').references(() => courseQuizzes.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(),
  options: jsonb('options'),
  correctAnswer: text('correct_answer'),
  explanation: text('explanation'),
  order: integer('order').default(0),
  points: integer('points').default(1),
}, (table) => [
  index('question_quiz_idx').on(table.quizId),
]);

// نمرات دانشجو
export const grades = pgTable('grade', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  lessonId: text('lesson_id').references(() => courseLessons.id),
  gradeType: gradeTypeEnum('grade_type').notNull(),
  score: decimal('score', { precision: 5, scale: 2 }).notNull(),
  maxScore: decimal('max_score', { precision: 5, scale: 2 }).default('100'),
  feedback: text('feedback'),
  gradedBy: text('graded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('grade_user_course_idx').on(table.userId, table.courseId),
]);

// گواهی پایان دوره
export const certificates = pgTable('certificate', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  certificateUrl: text('certificate_url'),
  certificateNumber: text('certificate_number').unique(),
}, (table) => [
  index('certificate_user_course_idx').on(table.userId, table.courseId),
]);

// نظرات و امتیازدهی
export const courseReviews = pgTable('course_review', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('review_course_idx').on(table.courseId),
]);

// ==================== RELATIONS ====================

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(courseCategories),
  semester: one(semesters),
  mainInstructor: one(users),
  coInstructors: many(courseInstructors),
  groups: many(courseGroups),
  enrollments: many(enrollments),
  modules: many(courseModules),
  reviews: many(courseReviews),
  certificates: many(certificates),
}));

export const courseInstructorsRelations = relations(courseInstructors, ({ one }) => ({
  course: one(courses),
  instructor: one(users),
}));

export const courseGroupsRelations = relations(courseGroups, ({ one, many }) => ({
  course: one(courses),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users),
  course: one(courses),
  group: one(courseGroups),
  semester: one(semesters),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses),
  lessons: many(courseLessons),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  module: one(courseModules),
  instructors: many(lessonInstructors),        // چند استادی در سطح درس + درصد درآمد
  liveClasses: many(liveClasses),
  files: many(lessonFiles),
  quizzes: many(courseQuizzes),
  attendance: many(attendance),
}));

export const lessonInstructorsRelations = relations(lessonInstructors, ({ one }) => ({
  lesson: one(courseLessons),
  instructor: one(users),
}));

export const liveClassesRelations = relations(liveClasses, ({ one }) => ({
  lesson: one(courseLessons),
}));

export const lessonFilesRelations = relations(lessonFiles, ({ one }) => ({
  lesson: one(courseLessons),
  uploadedByUser: one(users),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  lesson: one(courseLessons),
  user: one(users),
}));

export const courseQuizzesRelations = relations(courseQuizzes, ({ one, many }) => ({
  lesson: one(courseLessons),
  questions: many(quizQuestions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(courseQuizzes),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  user: one(users),
  course: one(courses),
  lesson: one(courseLessons),
  gradedByUser: one(users),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users),
  course: one(courses),
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
  course: one(courses),
  user: one(users),
}));

export const usersRelations = relations(users, ({ many }) => ({
  taughtCourses: many(courses),
  coTaughtCourses: many(courseInstructors),
  lessonInstructorships: many(lessonInstructors),
  enrollments: many(enrollments),
  blogPosts: many(blogPosts),
  products: many(products),
  grades: many(grades),
  certificates: many(certificates),
  reviews: many(courseReviews),
  attendanceRecords: many(attendance),
  uploadedFiles: many(lessonFiles),
  auditLogs: many(auditLogs),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ one, many }) => ({
  parent: one(blogCategories, { fields: [blogCategories.parentId], references: [blogCategories.id] }),
  children: many(blogCategories),
  posts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
  category: one(blogCategories, { fields: [blogPosts.categoryId], references: [blogCategories.id] }),
  tags: many(blogPostTags),
  comments: many(blogComments),
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, { fields: [blogPostTags.postId], references: [blogPosts.id] }),
  tag: one(blogTags, { fields: [blogPostTags.tagId], references: [blogTags.id] }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  post: one(blogPosts, { fields: [blogComments.postId], references: [blogPosts.id] }),
  user: one(users, { fields: [blogComments.userId], references: [users.id] }),
  parent: one(blogComments, { fields: [blogComments.parentId], references: [blogComments.id] }),
  replies: many(blogComments),
}));

// Relations احراز هویت
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Relations سازمان
export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  members: many(organizationMembers),
  owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations),
  user: one(users),
}));
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
export const productsRelations = relations(products, ({ many }) => ({
  categories: many(productCategories),
  tags: many(productTags),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products),
  tag: one(blogTags),
}));