// schema/coupons.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { users } from './users';

export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed']);

export const coupons = pgTable('coupon', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').unique().notNull(),

  type: couponTypeEnum('type').notNull(),
  value: integer('value').notNull(), // درصد یا مقدار ثابت

  minOrderAmount: integer('min_order_amount').default(0),
  maxDiscountAmount: integer('max_discount_amount'), // حداکثر تخفیف (برای درصد)

  usageLimit: integer('usage_limit'), // تعداد دفعات استفاده کلی
  perUserLimit: integer('per_user_limit').default(1),

  startsAt: timestamp('starts_at'),
  expiresAt: timestamp('expires_at'),

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('coupon_code_idx').on(table.code),
  index('coupon_active_idx').on(table.isActive),
]);

// رابطه با سفارشات (بعداً در orders استفاده می‌شود)
export const couponUsage = pgTable('coupon_usage', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  couponId: text('coupon_id').references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),

  usedAt: timestamp('used_at').defaultNow().notNull(),
});