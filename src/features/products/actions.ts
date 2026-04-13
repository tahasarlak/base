'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc, ilike, and, count, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { ProductFilters, CreateProductInput, UpdateProductInput } from './types';

/**
 * دریافت لیست محصولات با pagination و فیلتر
 */
export async function getProducts(filters: ProductFilters = {}) {
  const {
    page = 1,
    pageSize = 15,
    search,
    type,
    status,
    isFeatured,
    minPrice,
    maxPrice,
  } = filters;

  const offset = (page - 1) * pageSize;

  const whereConditions: any[] = [];

  if (search) {
    whereConditions.push(ilike(products.title, `%${search}%`));
  }
  if (type) {
    whereConditions.push(eq(products.type, type));
  }
  if (status) {
    whereConditions.push(eq(products.status, status));
  }
  if (isFeatured !== undefined) {
    whereConditions.push(eq(products.isFeatured, isFeatured));
  }
  if (minPrice !== undefined) {
    whereConditions.push(gte(products.price, minPrice));
  }
  if (maxPrice !== undefined) {
    whereConditions.push(lte(products.price, maxPrice));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // نسخه ساده بدون with برای جلوگیری از ارور رابطه (categories و tags)
  const productList = await db.query.products.findMany({
    where: whereClause,
    orderBy: [desc(products.createdAt)],
    limit: pageSize,
    offset,
    // با کامنت کردن with، ارور "There is not enough information to infer relation" رفع می‌شود
    // with: {
    //   categories: true,
    //   tags: {
    //     with: { tag: true },
    //   },
    // },
  });

  const totalResult = await db
    .select({ count: count() })
    .from(products)
    .where(whereClause);

  const total = Number(totalResult[0]?.count || 0);

  return {
    data: productList,
    total,
    page,
    pageSize,
  };
}

/**
 * ایجاد محصول جدید
 */
export async function createProduct(data: CreateProductInput) {
  const slug = data.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;

  const [newProduct] = await db.insert(products).values({
    title: data.title,
    slug,
    description: data.description || null,
    shortDescription: data.shortDescription || null,
    price: data.price,
    discountPrice: data.discountPrice || null,
    type: data.type,
    status: data.status || 'draft',
    featuredImage: data.featuredImage || null,
    images: data.images || [],
    metadata: data.metadata || {},
    stock: data.stock || 0,
    isFeatured: data.isFeatured || false,
    publishedAt: data.status === 'published' ? new Date() : null,
  }).returning();

  console.log(`✅ محصول جدید ایجاد شد | ID: ${newProduct.id} | Title: ${newProduct.title}`);

  return newProduct;
}

/**
 * ویرایش محصول
 */
export async function updateProduct(data: UpdateProductInput) {
  const { id, ...updateData } = data;

  const [updatedProduct] = await db
    .update(products)
    .set({
      ...updateData,
      updatedAt: new Date(),
      publishedAt: updateData.status === 'published' ? new Date() : null,
    })
    .where(eq(products.id, id))
    .returning();

  console.log(`✅ محصول ویرایش شد | ID: ${updatedProduct.id}`);

  return updatedProduct;
}

/**
 * حذف محصول
 */
export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/dashboard/products');
  console.log(`🗑️ محصول حذف شد | ID: ${id}`);
}