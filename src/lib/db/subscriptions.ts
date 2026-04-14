// schema/subscriptions.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'expired',
  'past_due',
  'trialing',
]);

export const subscriptions = pgTable('subscription', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  planName: text('plan_name').notNull(),
  price: integer('price').notNull(),

  interval: text('interval').notNull(), // monthly, yearly, lifetime
  status: subscriptionStatusEnum('status').default('active').notNull(),

  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),

  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),

  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('subscription_user_idx').on(table.userId),
  index('subscription_status_idx').on(table.status),
]);