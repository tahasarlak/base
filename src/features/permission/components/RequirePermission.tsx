'use client';
import { usePermissions } from '../hooks/use-permissions';
import { Permission } from '@/types/permission';
import { ReactNode } from 'react';

interface Props {
  permissions: Permission[] | Permission | null;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ 
  permissions, 
  children, 
  fallback = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-6">🔒</div>
      <h2 className="text-2xl font-semibold mb-2">دسترسی ممنوع</h2>
      <p className="text-muted-foreground max-w-md">
        شما مجوز لازم برای دسترسی به این بخش را ندارید.
      </p>
    </div>
  )
}: Props) {
  const { hasAnyPermission, isSuperAdmin } = usePermissions();

  // super_admin همیشه دسترسی کامل دارد
  if (isSuperAdmin) return <>{children}</>;

  // اگر permissions null یا خالی باشد → دسترسی آزاد
  if (permissions === null || (Array.isArray(permissions) && permissions.length === 0)) {
    return <>{children}</>;
  }

  const required = Array.isArray(permissions) ? permissions : [permissions];
  const hasAccess = hasAnyPermission(required);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}