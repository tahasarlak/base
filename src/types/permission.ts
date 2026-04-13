export type Role = 
  | 'super_admin'
  | 'admin'
  | 'instructor'
  | 'seller'
  | 'blogger'
  | 'support'
  | 'student'
  | 'customer'
  | 'user';

export type Permission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'organization:manage'
  | 'audit:read'
  | 'audit:write'
  | 'analytics:read'
  | 'settings:write'
  | 'courses:manage'
  | 'courses:publish'
  | 'courses:read'
  | 'products:manage'
  | 'products:read'
  | 'blog:read'        // ← اضافه شد
  | 'blog:write'
  | 'blog:publish'
  | 'tickets:manage'
  | 'tickets:respond'
  | 'payments:read'
  | 'payments:refund';

export const rolePermissions: Record<Role, Permission[] | '*'> = {
  super_admin: '*',

  admin: [
    'users:read', 'users:write', 'users:delete',
    'organization:manage',
    'audit:read', 'audit:write',
    'analytics:read',
    'settings:write',
    'courses:manage', 'courses:publish', 'courses:read',
    'products:manage', 'products:read',
    'blog:read', 'blog:write', 'blog:publish',   // ← اضافه شد
    'tickets:manage',
    'payments:read', 'payments:refund'
  ],

  instructor: [
    'courses:manage', 'courses:publish', 'courses:read',
    'analytics:read'
  ],

  seller: [
    'products:manage', 'products:read',
    'payments:read',
    'analytics:read'
  ],

  blogger: [
    'blog:read',      // ← اضافه شد (خیلی مهم)
    'blog:write',
    'blog:publish'
  ],

  support: [
    'tickets:manage',
    'tickets:respond',
    'users:read'
  ],

  student: [
    'courses:read',
    'payments:read'
  ],

  customer: [
    'products:read',
    'payments:read'
  ],

  user: [
    'settings:write'
  ]
};