'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CourseWithRelations } from './types';

export const courseColumns: ColumnDef<CourseWithRelations>[] = [
  {
    accessorKey: 'title',
    header: 'عنوان دوره',
    cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'دسته‌بندی',
    cell: ({ row }) => row.original.category?.name || '-',
  },
  {
    accessorKey: 'price',
    header: 'قیمت',
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      const discount = row.original.discountPrice;
      return discount ? (
        <div>
          <span className="line-through text-muted-foreground text-sm">
            {formatPrice(price)}
          </span>{' '}
          <span className="font-medium">{formatPrice(discount)}</span>
        </div>
      ) : (
        <span className="font-medium">{formatPrice(price)}</span>
      );
    },
  },
  {
    accessorKey: 'isPublished',
    header: 'وضعیت',
    cell: ({ row }) => {
      const published = row.getValue('isPublished') as boolean;
      return (
        <Badge variant={published ? 'default' : 'secondary'}>
          {published ? 'منتشر شده' : 'پیش‌نویس'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'level',
    header: 'سطح',
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ ایجاد',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('fa-IR'),
  },
  {
    id: 'actions',
    header: 'عملیات',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];