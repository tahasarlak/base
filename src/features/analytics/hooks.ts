// hooks.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAnalyticsData } from './actions';
import { AnalyticsFilters, AnalyticsData } from './types';


export function useAnalytics(initialFilters: AnalyticsFilters = {}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);

  const fetchAnalytics = useCallback(async (newFilters?: AnalyticsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = newFilters || filters;
      const result = await getAnalyticsData(currentFilters);

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات تحلیلی');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // اولین لود
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = () => fetchAnalytics();
  const updateFilters = (newFilters: Partial<AnalyticsFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    fetchAnalytics(updated);
  };

  return {
    data,
    loading,
    error,
    refresh,
    filters,
    updateFilters,
  };
}