// src/features/audit/types.ts

export type AuditLog = {
  id: string;
  userId: string | null;
  userName?: string | null;

  event: string;                    // مهم‌ترین فیلد (مثل "product.created")
  action?: string | null;           // create, update, delete, login, ...

  entityType: string | null;        // product, order, user, course, ...
  entityId: string | null;

  oldValue: any;                    // jsonb
  newValue: any;                    // jsonb

  ipAddress: string | null;
  userAgent: string | null;

  createdAt: Date;
};

export interface AuditFilters {
  page?: number;
  pageSize?: number;
  event?: string;                   // جستجو بر اساس event
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;                  // جستجوی کلی در event یا entityType
}