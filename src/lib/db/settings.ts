// schema/settings.ts
import { pgTable, text, jsonb, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const settings = pgTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => 'global_settings'), // فقط یک رکورد

  // اطلاعات پایه سایت
  siteName: text('site_name').notNull().default('My Universal Site'),
  siteDescription: text('site_description'),
  siteUrl: text('site_url'),
  logo: text('logo'),
  favicon: text('favicon'),

  // سئو پیش‌فرض
  defaultSeoTitle: text('default_seo_title'),
  defaultSeoDescription: text('default_seo_description'),
  defaultSeoKeywords: text('default_seo_keywords'),

  // تنظیمات مالی
  currency: text('currency').default('IRR').notNull(),
  taxRate: integer('tax_rate').default(0), // درصد مالیات
  shippingCost: integer('shipping_cost').default(0),

  // ویژگی‌ها
  maintenanceMode: boolean('maintenance_mode').default(false),
  allowRegistration: boolean('allow_registration').default(true),
  emailVerificationRequired: boolean('email_verification_required').default(true),

  // تنظیمات ایمیل
  emailFromName: text('email_from_name'),
  emailFromAddress: text('email_from_address'),

  // تنظیمات پیشرفته
  socialLinks: jsonb('social_links').default({}),
  customScripts: jsonb('custom_scripts').default({}), // هدر و فوتر اسکریپت
  features: jsonb('features').default({}), // فعال/غیرفعال کردن ماژول‌ها

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});