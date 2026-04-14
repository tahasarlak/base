// schema/pages.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const pages = pgTable('page', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  content: text('content'), // یا jsonb برای Tiptap

  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),

  isPublished: boolean('is_published').default(false),
  isSystem: boolean('is_system').default(false), // صفحات سیستمی مثل about, contact

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});