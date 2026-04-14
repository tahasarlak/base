// schema/wallets.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  boolean,
  uniqueIndex,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// ==================== ENUMS ====================
export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
  'deposit',        // شارژ کیف پول
  'purchase',       // پرداخت برای خرید
  'refund',         // بازگشت وجه خرید
  'withdrawal',     // برداشت به حساب بانکی / درگاه
  'bonus',          // جایزه، اعتبار هدیه، پاداش
  'commission',     // کمیسیون فروش (برای مارکت‌پلیس)
  'admin_adjustment', // تنظیم دستی توسط ادمین
  'referral',       // پاداش دعوت از دوستان
]);

export const walletTransactionStatusEnum = pgEnum('wallet_transaction_status', [
  'pending',
  'completed',
  'failed',
  'rejected',
  'canceled',
]);

// ==================== WALLETS (کیف پول اصلی هر کاربر) ====================
export const wallets = pgTable('wallet', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),

  // موجودی‌ها
  balance: integer('balance').default(0).notNull(),           // موجودی قابل استفاده
  frozenBalance: integer('frozen_balance').default(0).notNull(), // موجودی مسدود شده (مثلاً در سفارشات در حال پردازش)

  // آمار کلی
  totalDeposited: integer('total_deposited').default(0).notNull(), // کل مبلغ شارژ شده تا حالا
  totalSpent: integer('total_spent').default(0).notNull(),         // کل مبلغ خرج شده
  totalEarned: integer('total_earned').default(0).notNull(),       // کل درآمد (کمیسیون، جایزه و ...)

  // تنظیمات کیف پول
  isActive: boolean('is_active').default(true),
  lastTransactionAt: timestamp('last_transaction_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('wallet_user_unique_idx').on(table.userId),
  index('wallet_user_idx').on(table.userId),
  index('wallet_last_tx_idx').on(table.lastTransactionAt),
]);

// ==================== WALLET TRANSACTIONS (تراکنش‌های کیف پول) ====================
export const walletTransactions = pgTable('wallet_transaction', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  walletId: text('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }).notNull(),

  type: walletTransactionTypeEnum('type').notNull(),
  status: walletTransactionStatusEnum('status').default('completed').notNull(),

  amount: integer('amount').notNull(),           // مثبت = ورود وجه، منفی = خروج وجه

  description: text('description'),
  referenceId: text('reference_id'),             // می‌تواند به order_id، payment_id و ... اشاره کند

  // اطلاعات اضافی
  metadata: jsonb('metadata').default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
}, (table) => [
  index('wallet_tx_wallet_idx').on(table.walletId),
  index('wallet_tx_user_idx').on(table.userId),
  index('wallet_tx_type_idx').on(table.type),
  index('wallet_tx_status_idx').on(table.status),
  index('wallet_tx_created_idx').on(table.createdAt.desc()),
]);

// ==================== RELATIONS ====================
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets),
  user: one(users),
}));