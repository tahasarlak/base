'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from './actions';
import { AuditFilters, AuditLog } from './types';

export function useAuditLogs(initialFilters: AuditFilters = {}) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    pageSize: 20,
    ...initialFilters,
  });

  const fetchLogs = useCallback(async (newFilters: Partial<AuditFilters> = {}) => {
    try {
      setLoading(true);
      setError(null);

      const updatedFilters = { ...filters, ...newFilters };
      const result = await getAuditLogs(updatedFilters);

      setData(result.data);
      setTotal(result.total);
      setFilters(updatedFilters);   // فقط وقتی واقعاً تغییر کرده آپدیت کن
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در دریافت لاگ‌ها';
      setError(message);
      console.error('Audit logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);   // وابستگی به filters نگه داریم

  // فقط یک بار در mount اولیه اجرا بشه (حتی با Strict Mode)
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);   // وابستگی خالی → فقط mount

  const changePage = (newPage: number) => {
    fetchLogs({ page: newPage });
  };

  const updateFilters = (newFilters: Partial<AuditFilters>) => {
    fetchLogs(newFilters);
  };

  const refresh = () => fetchLogs();

  return {
    data,
    total,
    loading,
    error,
    refresh,
    filters,
    updateFilters,
    changePage,
    page: filters.page || 1,
    pageSize: filters.pageSize || 20,
  };
}