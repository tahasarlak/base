// schema/notifications.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'success',
  'warning',
  'error',
  'system',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'in_app',
  'email',
  'push',
  'sms',
]);

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable('notification', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  title: text('title').notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').default('info').notNull(),

  channel: notificationChannelEnum('channel').default('in_app').notNull(),

  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),

  // لینک مرتبط (مثلاً به سفارش، محصول، دوره و ...)
  link: text('link'),
  entityType: text('entity_type'),
  entityId: text('entity_id'),

  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),           // برای اعلان‌های موقتی
}, (table) => [
  index('notification_user_idx').on(table.userId),
  index('notification_read_idx').on(table.isRead),
  index('notification_created_idx').on(table.createdAt.desc()),
  index('notification_type_idx').on(table.type),
]);

// ==================== RELATIONS ====================
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users),
}));