'use client';
import DynamicDataTable from '@/components/ui/DynamicDataTable';
import { AuditLog } from '../types';
import { useAuditLogs } from '../hooks';
import { auditColumns } from '../table-config';

type AuditLogsClientProps = {
  initialData: AuditLog[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
};

export default function AuditLogsClient({
  initialData,
  initialTotal,
  initialPage,
  initialPageSize,
}: AuditLogsClientProps) {
  const {
    data,
    total,
    loading,
    page,
    pageSize,
    changePage,
  } = useAuditLogs({
    page: initialPage,
    pageSize: initialPageSize,
  });

  return (
    <DynamicDataTable
      data={data.length ? data : initialData}   
      columns={auditColumns}
      searchKey="action"
      placeholder="جستجو بر اساس عملیات یا نوع هدف..."
      loading={loading}                         
      pagination={{
        total: total || initialTotal,
        page: page,
        pageSize: pageSize,
        onPageChange: changePage,
      }}
    />
  );
}