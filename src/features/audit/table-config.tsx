// src/features/audit/audit-columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { AuditLog } from './types';

export const auditColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'زمان',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(new Date(row.getValue('createdAt')))}
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'عملیات',
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      return (
        <Badge variant="outline" className="font-mono text-xs">
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'userName',
    header: 'کاربر',
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string | null;
      const userId = row.getValue('userId') as string | null;
      return userName || userId || '—';
    },
  },
  {
    accessorKey: 'targetType',
    header: 'نوع هدف',
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.getValue('targetType') || '—'}
      </Badge>
    ),
  },
  {
    accessorKey: 'targetId',
    header: 'شناسه هدف',
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue('targetId') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'oldValue',
    header: 'مقدار قبلی',
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-xs text-muted-foreground">
        {row.getValue('oldValue') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'newValue',
    header: 'مقدار جدید',
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-xs text-muted-foreground">
        {row.getValue('newValue') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'آی‌پی',
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue('ipAddress') || '—'}
      </div>
    ),
  },
];