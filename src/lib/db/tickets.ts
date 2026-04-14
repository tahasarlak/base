// schema/tickets.ts
import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  index,boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'answered',
  'closed',
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const tickets = pgTable('ticket', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }).notNull(),

  subject: text('subject').notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  priority: ticketPriorityEnum('priority').default('medium').notNull(),

  assignedTo: text('assigned_to').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('ticket_user_idx').on(table.userId),
  index('ticket_status_idx').on(table.status),
]);

export const ticketReplies = pgTable('ticket_reply', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketId: text('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  message: text('message').notNull(),
  isAdminReply: boolean('is_admin_reply').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});