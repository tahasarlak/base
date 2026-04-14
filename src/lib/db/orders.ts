// schema/orders.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { products, productVariants } from './products';

// ==================== ENUMS ====================
export const orderStatusEnum = pgEnum('order_status', [
  'pending',      // در انتظار پرداخت
  'processing',   // در حال پردازش
  'paid',         // پرداخت شده
  'shipped',      // ارسال شده
  'delivered',    // تحویل داده شده
  'cancelled',    // لغو شده
  'refunded',     // برگشت وجه
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'online',               // پرداخت آنلاین (درگاه)
  'wallet',               // کیف پول داخلی
  'cash_on_delivery',     // پرداخت در محل
  'bank_transfer',        // انتقال بانکی
  'crypto',               // کریپتوکارنسی
]);

// ==================== ORDERS ====================
export const orders = pgTable('order', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }).notNull(),

  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: integer('total_amount').notNull(),           // جمع کل قبل از تخفیف
  discountAmount: integer('discount_amount').default(0),
  finalAmount: integer('final_amount').notNull(),           // مبلغ نهایی پرداخت

  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: text('payment_status').default('pending'), // pending, paid, failed

  paymentId: text('payment_id'),           // شناسه تراکنش درگاه
  transactionId: text('transaction_id'),

  // آدرس ارسال (برای محصولات فیزیکی)
  shippingAddress: jsonb('shipping_address').$type<{
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country?: string;
  }>(),

  trackingCode: text('tracking_code'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),

  notes: text('notes'),
  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('order_user_idx').on(table.userId),
  index('order_status_idx').on(table.status),
  index('order_created_idx').on(table.createdAt.desc()),
  index('order_payment_idx').on(table.paymentStatus),
]);

// ==================== ORDER ITEMS ====================
export const orderItems = pgTable('order_item', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),

  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

  quantity: integer('quantity').notNull().default(1),

  // قیمت در لحظه خرید (برای جلوگیری از تغییر قیمت در آینده)
  priceAtPurchase: integer('price_at_purchase').notNull(),
  discountPriceAtPurchase: integer('discount_price_at_purchase'),

  productTitle: text('product_title').notNull(),
  productSlug: text('product_slug'),
  variantAttributes: jsonb('variant_attributes').$type<Record<string, any>>(), // { color: "مشکی", size: "XL" }

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('order_item_order_idx').on(table.orderId),
  index('order_item_product_idx').on(table.productId),
  index('order_item_variant_idx').on(table.variantId),
]);

// ==================== RELATIONS ====================
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders),
  product: one(products),
  variant: one(productVariants),
}));