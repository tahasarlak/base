// src/features/audit/types.ts
export type AuditLog = {
  id: string;
  userId: string | null;
  userName?: string | null;        // برای نمایش بهتر
  action: string;
  targetId: string | null;
  targetType: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export interface AuditFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  targetType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}