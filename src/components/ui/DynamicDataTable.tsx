'use client';

import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';

type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

type DynamicDataTableProps<T = any> = {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey: string;
  placeholder?: string;
  loading?: boolean;          
  pagination?: PaginationProps;
};

export default function DynamicDataTable<T>({
  data,
  columns,
  searchKey,
  placeholder = "جستجو کنید...",
  loading = false,            
  pagination,
}: DynamicDataTableProps<T>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey={searchKey}
      placeholder={placeholder}
      pagination={pagination}
      loading={loading}            
    />
  );
}