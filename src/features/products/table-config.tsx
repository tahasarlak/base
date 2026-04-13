'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils'; // اگر تابع قیمت داری
import { Product } from './types';

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'title',
    header: 'نام محصول',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('title')}</div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'نوع',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const labels: Record<string, string> = {
        digital: 'دیجیتال',
        physical: 'فیزیکی',
        course: 'دوره آموزشی',
        subscription: 'اشتراکی',
        service: 'خدمات',
      };
      return <Badge variant="outline">{labels[type] || type}</Badge>;
    },
  },
  {
    accessorKey: 'price',
    header: 'قیمت',
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      const discount = row.original.discountPrice;
      return (
        <div>
          {discount ? (
            <>
              <span className="line-through text-muted-foreground text-sm">
                {formatPrice(price)}
              </span>{' '}
              <span className="font-medium">{formatPrice(discount)}</span>
            </>
          ) : (
            <span className="font-medium">{formatPrice(price)}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'وضعیت',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const colors: Record<string, string> = {
        published: 'bg-green-100 text-green-700',
        draft: 'bg-yellow-100 text-yellow-700',
        archived: 'bg-gray-100 text-gray-700',
      };
      return (
        <Badge className={colors[status] || ''}>
          {status === 'published' ? 'منتشر شده' : status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: 'موجودی',
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