import { products } from '@/lib/db/schema';

export type Product = typeof products.$inferSelect;

export type ProductWithRelations = Product & {
  categories: Array<{
    id: string;
    name?: string;   // اگر بعداً نیاز داشتی اضافه کن
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export type ProductFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'digital' | 'physical' | 'course' | 'subscription' | 'service';
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

export type CreateProductInput = {
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  type: 'digital' | 'physical' | 'course' | 'subscription' | 'service';
  status?: 'draft' | 'published' | 'archived';
  featuredImage?: string | null;
  images?: string[];
  metadata?: any;
  stock?: number;
  isFeatured?: boolean;
};

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'id'>> & {
  id: string;
};