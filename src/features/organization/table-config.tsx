// src/features/organization/table-config.ts
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;           // owner, admin, member
  createdAt: Date;
};

export const organizationColumns: ColumnDef<Organization>[] = [
  {
    accessorKey: 'name',
    header: 'نام سازمان',
  },
  {
    accessorKey: 'slug',
    header: 'شناسه یکتا',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.getValue('slug')}
      </span>
    ),
  },
  {
    accessorKey: 'role',
    header: 'نقش شما',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={role === 'owner' ? 'default' : 'secondary'}>
          {role === 'owner' ? 'مالک' : role === 'admin' ? 'مدیر' : 'عضو'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ ایجاد',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('fa-IR'),
  },
];

export const fetchOrganizations = async () => {
  const res = await fetch('/api/organizations', { 
    cache: 'no-store',
    next: { revalidate: 0 }
  });
  
  if (!res.ok) throw new Error('خطا در دریافت لیست سازمان‌ها');
  return res.json();
};