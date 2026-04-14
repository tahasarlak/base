// schema/payments.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { orders } from './orders';

// ==================== ENUMS ====================
export const paymentGatewayEnum = pgEnum('payment_gateway', [
  'zarinpal',      // زرین‌پال
  'nextpay',       // نکست‌پی
  'payping',       // پی‌پینگ
  'stripe',        // استرایپ (برای پرداخت بین‌المللی)
  'paypal',
  'crypto',        // پرداخت کریپتو
  'wallet',        // از کیف پول داخلی
  'bank_transfer', // انتقال بانکی
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
  'canceled',
  'expired',
]);

// ==================== PAYMENTS TABLE ====================
export const payments = pgTable('payment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),

  amount: integer('amount').notNull(),                    // مبلغ به ریال / سنت
  currency: text('currency').default('IRR').notNull(),

  gateway: paymentGatewayEnum('gateway').notNull(),
  gatewayTransactionId: text('gateway_transaction_id'),   // شناسه تراکنش در درگاه
  referenceId: text('reference_id'),                      // شماره پیگیری

  status: paymentStatusEnum('status').default('pending').notNull(),
  
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),

  // اطلاعات اضافی درگاه
  gatewayResponse: jsonb('gateway_response'),             // پاسخ کامل درگاه برای دیباگ

  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('payment_user_idx').on(table.userId),
  index('payment_order_idx').on(table.orderId),
  index('payment_status_idx').on(table.status),
  index('payment_gateway_idx').on(table.gateway),
  index('payment_created_idx').on(table.createdAt.desc()),
]);

// ==================== RELATIONS ====================
export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users),
  order: one(orders),
}));