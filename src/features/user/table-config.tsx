// src/features/user/table-config.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { changeUserRole } from './actions';
import type { User } from './types';

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'نام',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('name') || <span className="text-muted-foreground">بدون نام</span>}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'ایمیل',
  },
  {
    accessorKey: 'role',
    header: 'نقش',
    cell: ({ row }) => {
      const role = (row.getValue('role') as string) || 'user';

      const roleLabels: Record<string, string> = {
        super_admin: 'مالک',
        admin: 'مدیر',
        instructor: 'استاد',
        seller: 'فروشنده',
        blogger: 'بلاگ‌نویس',
        support: 'پشتیبانی',
        student: 'دانشجو',
        customer: 'مشتری',
        user: 'کاربر عادی',
      };

      return (
        <Badge variant={['super_admin', 'admin'].includes(role) ? 'default' : 'secondary'}>
          {roleLabels[role] || role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'emailVerified',
    header: 'تأیید ایمیل',
    cell: ({ row }) => (
      <Badge variant={row.getValue('emailVerified') ? 'default' : 'destructive'}>
        {row.getValue('emailVerified') ? 'تأیید شده' : 'تأیید نشده'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ ثبت',
    cell: ({ row }) => formatDate(new Date(row.getValue('createdAt') as string | Date)),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const [isPending, startTransition] = useTransition();

      const handleRoleChange = (newRole: string) => {
        if (user.role === 'super_admin' && newRole !== 'super_admin') {
          toast.error('نقش super_admin قابل تغییر نیست');
          return;
        }

        const fd = new FormData();
        fd.append('userId', user.id);
        fd.append('newRole', newRole);

        startTransition(async () => {
          try {
            await changeUserRole(fd);
            toast.success('نقش با موفقیت تغییر کرد');
            // refreshUsers از کامپوننت والد فراخوانی می‌شود
          } catch (error: any) {
            toast.error(error.message || 'خطا در تغییر نقش');
          }
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleRoleChange('admin')}>مدیر</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('instructor')}>استاد</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('seller')}>فروشنده</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('blogger')}>بلاگ‌نویس</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('support')}>پشتیبانی</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('student')}>دانشجو</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('customer')}>مشتری</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('user')}>کاربر عادی</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];  