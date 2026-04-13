'use client';

import { useState, useCallback, useEffect } from 'react';
import { getBlogPosts } from './actions';
import { BlogFilters, BlogPostWithRelations } from './types';

export function useBlogPosts(initialFilters: BlogFilters = {}) {
  const [data, setData] = useState<BlogPostWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    pageSize: 15,
    ...initialFilters,
  });

  const fetchPosts = useCallback(async (newFilters: Partial<BlogFilters> = {}) => {
    const updatedFilters = { ...filters, ...newFilters };
    console.log('🔄 Fetching with:', updatedFilters);

    try {
      setLoading(true);
      setError(null);

      const result = await getBlogPosts(updatedFilters);

      console.log(`📊 Received ${result.data.length} posts, total: ${result.total}`);

      setData(result.data || []);
      setTotal(result.total || 0);
      setFilters(updatedFilters);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'خطا در دریافت مقالات');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // لود اولیه
  useEffect(() => {
    fetchPosts();
  }, []);

  const changePage = (newPage: number) => {
    fetchPosts({ page: newPage });
  };

  const refresh = useCallback(async () => {
    console.log('♻️ Manual refresh called - forcing reload');
    await fetchPosts({ page: 1 });
    setTimeout(() => {
      fetchPosts({ page: 1 });
    }, 100);
  }, [fetchPosts]);

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