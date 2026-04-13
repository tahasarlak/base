'use client';
import { useUserRole } from '@/hooks/use-user-role';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/permission';

export function usePermissions() {
  const { role } = useUserRole();

  return {
    hasPermission: (perm: Permission) => hasPermission(role, perm),
    hasAnyPermission: (perms: Permission[]) => hasAnyPermission(role, perms),
    hasAllPermissions: (perms: Permission[]) => hasAllPermissions(role, perms),
    
    role,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'super_admin',
    isInstructor: role === 'instructor',
    isSeller: role === 'seller',
    isSupport: role === 'support',
    isBlogger: role === 'blogger',
  };
}