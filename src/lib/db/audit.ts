// schema/audit.ts
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ==================== AUDIT LOGS ====================
export const auditLogs = pgTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),

  // اطلاعات رویداد
  event: text('event').notNull(),           // مثال: "product.created", "order.paid", "user.login"
  action: text('action'),                   // create, update, delete, login, view, etc.

  // موجودیت هدف
  entityType: text('entity_type'),          // product, order, user, course, blog_post, ...
  entityId: text('entity_id'),              // شناسه موجودیت

  // مقادیر قبل و بعد تغییر (برای لاگ تغییرات)
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),

  // اطلاعات درخواست
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // جزئیات اضافی
  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_user_idx').on(table.userId),
  index('audit_event_idx').on(table.event),
  index('audit_action_idx').on(table.action),
  index('audit_entity_idx').on(table.entityType, table.entityId),
  index('audit_created_idx').on(table.createdAt.desc()),
]);

// ==================== RELATIONS ====================
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users),
}));