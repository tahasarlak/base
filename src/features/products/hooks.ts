'use client';

import { useState, useCallback, useEffect } from 'react';
import { getProducts } from './actions';
import { ProductFilters, ProductWithRelations } from './types';

export function useProducts(initialFilters: ProductFilters = {}) {
  const [data, setData] = useState<ProductWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    pageSize: 15,
    ...initialFilters,
  });

  const fetchProducts = useCallback(async (newFilters: Partial<ProductFilters> = {}) => {
    const updatedFilters = { ...filters, ...newFilters };

    try {
      setLoading(true);
      setError(null);

      const result = await getProducts(updatedFilters);

      // تبدیل داده‌های دریافتی به شکل مورد نظر نوع ProductWithRelations
      const formattedData: ProductWithRelations[] = (result.data || []).map((product: any) => ({
        ...product,
        tags: product.tags
          ?.map((t: any) => t.tag)                    // استخراج tag واقعی
          .filter((tag: any): tag is NonNullable<typeof tag> => tag !== null) || [],
        categories: product.categories || [],
      }));

      setData(formattedData);
      setTotal(result.total || 0);
      setFilters(updatedFilters);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'خطا در دریافت محصولات');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // لود اولیه
  useEffect(() => {
    fetchProducts();
  }, []);   // وابستگی خالی — فقط یک بار

  const changePage = (newPage: number) => {
    fetchProducts({ page: newPage });
  };

  const refresh = useCallback(() => {
    fetchProducts({ page: 1 });
  }, [fetchProducts]);

  return {
    data,
    total,
    loading,
    error,
    changePage,
    refresh,
    page: filters.page || 1,
    pageSize: filters.pageSize || 15,
  };
}