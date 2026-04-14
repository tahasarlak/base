// schema/blog.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ==================== ENUMS ====================
export const blogPostStatusEnum = pgEnum('blog_post_status', [
  'draft',
  'published',
  'scheduled',
  'archived',
]);

// ==================== BLOG CATEGORIES ====================
export const blogCategories = pgTable('blog_category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  parentId: text('parent_id').references((): AnyPgColumn => blogCategories.id, { onDelete: 'set null' }),
  icon: text('icon'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('blog_category_slug_idx').on(table.slug),
  index('blog_category_parent_idx').on(table.parentId),
  index('blog_category_active_idx').on(table.isActive),
]);

// ==================== BLOG TAGS ====================
export const blogTags = pgTable('blog_tag', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('blog_tag_slug_idx').on(table.slug),
]);

// ==================== BLOG POSTS ====================
export const blogPosts = pgTable('blog_post', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: jsonb('content').notNull(),           // Tiptap / Editor JSON
  featuredImage: text('featured_image'),

  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  categoryId: text('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),

  status: blogPostStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at'),
  scheduledFor: timestamp('scheduled_for'),

  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),

  isFeatured: boolean('is_featured').default(false),
  viewsCount: integer('views_count').default(0),
  readingTime: integer('reading_time'),           // در دقیقه

  deletedAt: timestamp('deleted_at'),             // Soft Delete

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

// ==================== BLOG POST TAGS (Junction) ====================
export const blogPostTags = pgTable('blog_post_tag', {
  postId: text('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  tagId: text('tag_id').references(() => blogTags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  uniqueIndex('unique_blog_post_tag').on(table.postId, table.tagId),
]);

// ==================== BLOG COMMENTS ====================
export const blogComments = pgTable('blog_comment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  parentId: text('parent_id').references((): AnyPgColumn => blogComments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isApproved: boolean('is_approved').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('blog_comment_post_idx').on(table.postId),
  index('blog_comment_user_idx').on(table.userId),
  index('blog_comment_approved_idx').on(table.isApproved),
]);

// ==================== RELATIONS ====================
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
  post: one(blogPosts),
  tag: one(blogTags),
}));

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  post: one(blogPosts),
  user: one(users),
  parent: one(blogComments, { fields: [blogComments.parentId], references: [blogComments.id] }),
  replies: many(blogComments),
}));