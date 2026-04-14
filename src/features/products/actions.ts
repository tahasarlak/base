// actions/products.ts
'use server';

import { db } from '@/lib/db';
import { 
  products, 
  productVariants, 
  productCategories, 
  productCategoryRelationsTable,
  productTags,
  productSpecifications,
  productDigitalFiles,
  productShippingInfo,
  productReviews 
} from '@/lib/db/schema';
import { eq, desc, ilike, and, count, gte, lte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { ProductFilters, CreateProductInput, UpdateProductInput } from './types';


// ==================== دریافت لیست محصولات ====================
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
    categoryId,
  } = filters;

  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  if (search) {
    whereConditions.push(ilike(products.title, `%${search}%`));
  }
  if (type) whereConditions.push(eq(products.type, type));
  if (status) whereConditions.push(eq(products.status, status));
  if (isFeatured !== undefined) whereConditions.push(eq(products.isFeatured, isFeatured));
  if (minPrice !== undefined) whereConditions.push(gte(products.price, minPrice));
  if (maxPrice !== undefined) whereConditions.push(lte(products.price, maxPrice));
  if (categoryId) {
    whereConditions.push(
      sql`${products.id} IN (SELECT product_id FROM ${productCategoryRelationsTable} WHERE category_id = ${categoryId})`
    );
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // دریافت محصولات با relations مهم
  const productList = await db.query.products.findMany({
    where: whereClause,
    orderBy: [desc(products.createdAt)],
    limit: pageSize,
    offset,
    with: {
      variants: true,
      categories: {
        with: { category: true },
      },
      tags: {
        with: { tag: true },
      },
      specifications: true,
      digitalFiles: true,
      shippingInfo: true,
      reviews: true,
    },
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

// ==================== ایجاد محصول جدید ====================
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
    subtitle: data.subtitle || null,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    price: data.price,
    discountPrice: data.discountPrice || null,
    compareAtPrice: data.compareAtPrice || null,
    type: data.type,
    status: data.status || 'draft',
    featuredImage: data.featuredImage || null,
    images: data.images || [],
    metadata: data.metadata || {},
    stock: data.stock || 0,
    isFeatured: data.isFeatured || false,
    publishedAt: data.status === 'published' ? new Date() : null,
  }).returning();

  // اضافه کردن دسته‌بندی‌ها (اگر وجود داشت)
  if (data.categoryIds && data.categoryIds.length > 0) {
    await db.insert(productCategoryRelationsTable).values(
      data.categoryIds.map(categoryId => ({
        productId: newProduct.id,
        categoryId,
      }))
    );
  }

  console.log(`✅ محصول جدید ایجاد شد | ID: ${newProduct.id} | Title: ${newProduct.title}`);
  revalidatePath('/dashboard/products');
  
  return newProduct;
}

// ==================== ویرایش محصول ====================
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

  revalidatePath('/dashboard/products');
  console.log(`✅ محصول ویرایش شد | ID: ${updatedProduct.id}`);

  return updatedProduct;
}

// ==================== حذف محصول ====================
export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
  
  revalidatePath('/dashboard/products');
  console.log(`🗑️ محصول حذف شد | ID: ${id}`);
}