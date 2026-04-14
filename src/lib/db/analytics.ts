// schema/analytics.ts
import { pgTable, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const analytics = pgTable('analytics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  event: text('event').notNull(), // page_view, product_view, purchase, etc.
  userId: text('user_id'),
  sessionId: text('session_id'),

  entityType: text('entity_type'),
  entityId: text('entity_id'),

  metadata: jsonb('metadata').default({}),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('analytics_event_idx').on(table.event),
  index('analytics_created_idx').on(table.createdAt.desc()),
]);