// types/products.ts   یا داخل types.ts اصلی

import { products, productVariants, productReviews, productSpecifications, productDigitalFiles, productShippingInfo } from '@/lib/db/schema';

// ==================== تایپ پایه ====================
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductReview = typeof productReviews.$inferSelect;
export type ProductSpecification = typeof productSpecifications.$inferSelect;
export type ProductDigitalFile = typeof productDigitalFiles.$inferSelect;
export type ProductShippingInfo = typeof productShippingInfo.$inferSelect;

// ==================== تایپ کامل محصول با تمام روابط (مهم‌ترین تایپ) ====================

export type ProductWithRelations = Product & {
  variants: ProductVariant[];

  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;

  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;

  specifications: ProductSpecification[];
  digitalFiles: ProductDigitalFile[];
  shippingInfo: ProductShippingInfo | null;
  reviews: ProductReview[];

  // فیلدهای محاسبه شده توسط Drizzle (decimal به string تبدیل می‌شود)
  averageRating: string | null;     // مهم: string | null
  reviewCount: number | null;       // مهم: number | null (نه undefined)
};

// ==================== فیلترها ====================
export type ProductFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: Product['type'];
  status?: Product['status'];
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
};

// ==================== ورودی‌ها ====================
export type CreateProductInput = {
  title: string;
  subtitle?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  compareAtPrice?: number | null;
  type: Product['type'];
  status?: Product['status'];
  featuredImage?: string | null;
  images?: string[];
  metadata?: Record<string, any>;
  stock?: number;
  isFeatured?: boolean;
  categoryIds?: string[];
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  id: string;
};

// ==================== پاسخ هوک ====================
export type ProductsResponse = {
  data: ProductWithRelations[];
  total: number;
  page: number;
  pageSize: number;
};