import { ColumnDef } from '@tanstack/react-table';
import { BlogPostWithRelations } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

export const blogColumns: ColumnDef<BlogPostWithRelations>[] = [
  {
    accessorKey: 'title',
    header: 'عنوان مقاله',
  },
  {
    accessorKey: 'author',
    header: 'نویسنده',
    cell: ({ row }) => {
      const author = row.original.author;
      return author?.name || 'نامشخص';
    },
  },
  {
    accessorKey: 'category',
    header: 'دسته‌بندی',
    cell: ({ row }) => {
      const category = row.original.category;
      return category?.name || '-';
    },
  },
  {
    accessorKey: 'status',
    header: 'وضعیت',
    cell: ({ row }) => {
      const status = row.original.status;
      const colors: Record<string, string> = {
        published: 'bg-green-100 text-green-700',
        draft: 'bg-yellow-100 text-yellow-700',
        scheduled: 'bg-blue-100 text-blue-700',
        archived: 'bg-gray-100 text-gray-700',
      };
      return (
        <Badge className={colors[status] || 'bg-gray-100 text-gray-700'}>
          {status === 'draft' ? 'پیش‌نویس' : 
           status === 'published' ? 'منتشر شده' : 
           status === 'scheduled' ? 'زمان‌بندی شده' : 'بایگانی'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'viewsCount',
    header: 'بازدید',
    cell: ({ row }) => row.original.viewsCount || 0,
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