// src/components/layout/DashboardPageWrapper.tsx
import { RequirePermission } from '@/features/permission/components/RequirePermission';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  permissions?: string[] | string | null;   // string نگه می‌داریم چون در صفحه استفاده می‌شود
  title?: string;
}

export default function DashboardPageWrapper({
  children,
  permissions = null,
  title,
}: Props) {
  return (
    <RequirePermission permissions={permissions as any}>   {/* cast موقت */}
      {title && (
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        </div>
      )}
      <div className="min-h-[calc(100vh-200px)]">
        {children}
      </div>
    </RequirePermission>
  );
}