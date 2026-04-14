// schema/products.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { blogTags } from './blog';
import { orderItems } from './orders';

// ==================== ENUMS ====================
export const productTypeEnum = pgEnum('product_type', [
  'digital',
  'physical',
  'course',
  'subscription',
  'service',
  'bundle',
  'ticket',
  'membership',
]);

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'published',
  'scheduled',
  'archived',
  'out_of_stock',
]);

export const stockStatusEnum = pgEnum('stock_status', [
  'in_stock',
  'low_stock',
  'out_of_stock',
  'backorder',
]);

export const weightUnitEnum = pgEnum('weight_unit', ['kg', 'g', 'lb', 'oz']);
export const dimensionUnitEnum = pgEnum('dimension_unit', ['cm', 'inch', 'm']);

// ==================== MAIN PRODUCTS TABLE ====================
export const products = pgTable('product', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),

  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  subtitle: text('subtitle'),
  shortDescription: text('short_description'),
  description: text('description'),

  type: productTypeEnum('type').default('digital').notNull(),
  status: productStatusEnum('status').default('draft').notNull(),

  // قیمت‌گذاری
  price: integer('price').default(0).notNull(),
  discountPrice: integer('discount_price'),
  compareAtPrice: integer('compare_at_price'),
  currency: text('currency').default('IRR').notNull(),

  // موجودی و انبار
  sku: text('sku').unique(),
  barcode: text('barcode'),
  stock: integer('stock').default(0),
  stockStatus: stockStatusEnum('stock_status').default('in_stock'),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  allowBackorder: boolean('allow_backorder').default(false),

  // رسانه
  featuredImage: text('featured_image'),
  images: jsonb('images').$type<string[]>().default([]),

  // سئو و نمایش
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  isFeatured: boolean('is_featured').default(false),
  isVisible: boolean('is_visible').default(true),

  // آمار
  viewsCount: integer('views_count').default(0),
  salesCount: integer('sales_count').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewCount: integer('review_count').default(0),

  // زمان‌بندی
  publishedAt: timestamp('published_at'),
  scheduledFor: timestamp('scheduled_for'),

  // متادیتا
  metadata: jsonb('metadata').default({}),

  // Soft Delete
  deletedAt: timestamp('deleted_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_slug_idx').on(table.slug),
  uniqueIndex('product_sku_idx').on(table.sku),
  index('product_type_idx').on(table.type),
  index('product_status_idx').on(table.status),
  index('product_featured_idx').on(table.isFeatured),
  index('product_created_idx').on(table.createdAt.desc()),
]);

// ==================== PRODUCT VARIANTS ====================
export const productVariants = pgTable('product_variant', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),

  title: text('title').notNull(),
  sku: text('sku').unique(),
  price: integer('price'),
  discountPrice: integer('discount_price'),
  stock: integer('stock').default(0),

  attributes: jsonb('attributes').$type<Record<string, any>>(), // { color: "مشکی", size: "XL", ... }
  isDefault: boolean('is_default').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('variant_product_idx').on(table.productId),
  uniqueIndex('variant_sku_idx').on(table.sku),
]);

// ==================== CATEGORIES ====================
export const productCategories = pgTable('product_category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  parentId: text('parent_id').references((): AnyPgColumn => productCategories.id, { onDelete: 'set null' }),
  icon: text('icon'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('product_category_slug_idx').on(table.slug),
  index('product_category_parent_idx').on(table.parentId),
]);

export const productCategoryRelationsTable = pgTable('product_category_relation', {
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  categoryId: text('category_id').references(() => productCategories.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  uniqueIndex('unique_product_category').on(table.productId, table.categoryId),
]);

// ==================== TAGS ====================
export const productTags = pgTable('product_tag_relation', {
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  tagId: text('tag_id').references(() => blogTags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  uniqueIndex('unique_product_tag').on(table.productId, table.tagId),
]);

// ==================== SPECIFICATIONS ====================
export const productSpecifications = pgTable('product_specification', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  key: text('key').notNull(),
  value: text('value').notNull(),
  group: text('group'), // مثلاً "مشخصات فیزیکی" یا "مشخصات فنی"
  order: integer('order').default(0),
}, (table) => [
  index('spec_product_idx').on(table.productId),
]);

// ==================== DIGITAL FILES ====================
export const productDigitalFiles = pgTable('product_digital_file', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  fileType: text('file_type'),
  version: text('version'),
  isMainFile: boolean('is_main_file').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('digital_file_product_idx').on(table.productId),
]);

// ==================== SHIPPING INFO (برای محصولات فیزیکی) ====================
export const productShippingInfo = pgTable('product_shipping_info', {
  productId: text('product_id').primaryKey().references(() => products.id, { onDelete: 'cascade' }),
  weight: decimal('weight', { precision: 10, scale: 3 }),
  weightUnit: weightUnitEnum('weight_unit').default('kg'),
  length: decimal('length', { precision: 10, scale: 2 }),
  width: decimal('width', { precision: 10, scale: 2 }),
  height: decimal('height', { precision: 10, scale: 2 }),
  dimensionUnit: dimensionUnitEnum('dimension_unit').default('cm'),
  shippingClass: text('shipping_class'),
}, (table) => [
  index('shipping_product_idx').on(table.productId),
]);

// ==================== REVIEWS ====================
export const productReviews = pgTable('product_review', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1 تا 5
  title: text('title'),
  comment: text('comment'),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('review_product_idx').on(table.productId),
  index('review_user_idx').on(table.userId),
]);

// ==================== RELATIONS ====================
export const productsRelations = relations(products, ({ many, one }) => ({
  variants: many(productVariants),
  categories: many(productCategoryRelationsTable),
  tags: many(productTags),
  specifications: many(productSpecifications),
  digitalFiles: many(productDigitalFiles),
  shippingInfo: one(productShippingInfo),
  reviews: many(productReviews),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products),
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  parent: one(productCategories, { fields: [productCategories.parentId], references: [productCategories.id] }),
  children: many(productCategories),
  products: many(productCategoryRelationsTable),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products),
  user: one(users),
}));