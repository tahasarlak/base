'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCourses } from './actions';
import { CourseFilters, CourseWithRelations } from './types';

export function useCourses(initialFilters: CourseFilters = {}) {
  const [data, setData] = useState<CourseWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    pageSize: 15,
    ...initialFilters,
  });

  const fetchCourses = useCallback(async (newFilters: Partial<CourseFilters> = {}) => {
    const updatedFilters = { ...filters, ...newFilters };

    try {
      setLoading(true);
      setError(null);

      const result = await getCourses(updatedFilters);

      const formattedData: CourseWithRelations[] = result.data || [];

      setData(formattedData);
      setTotal(result.total || 0);
      setFilters(updatedFilters);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'خطا در دریافت دوره‌ها');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const changePage = (newPage: number) => {
    fetchCourses({ page: newPage });
  };

  const refresh = useCallback(() => {
    fetchCourses({ page: 1 });
  }, [fetchCourses]);

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