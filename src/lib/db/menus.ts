// schema/menus.ts
import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const menus = pgTable('menu', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // header, footer, sidebar, mobile
  location: text('location').notNull(),

  items: jsonb('items').$type<any[]>().default([]), // ساختار درختی منو

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});