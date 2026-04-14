// src/features/audit/actions.ts
'use server';

import { db } from '@/lib/db';
import { auditLogs, users } from '@/lib/db/schema';
import { desc, sql, eq, gte, lt, and, count } from 'drizzle-orm';
import type { AuditLog, AuditFilters } from './types';

export async function getAuditLogs(filters: AuditFilters = {}): Promise<{
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  // فیلترهای اصلی
  if (filters.event) whereConditions.push(eq(auditLogs.event, filters.event));
  if (filters.action) whereConditions.push(eq(auditLogs.action, filters.action));
  if (filters.entityType) whereConditions.push(eq(auditLogs.entityType, filters.entityType));
  if (filters.userId) whereConditions.push(eq(auditLogs.userId, filters.userId));

  // فیلتر تاریخ
  if (filters.startDate) {
    whereConditions.push(gte(auditLogs.createdAt, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    whereConditions.push(lt(auditLogs.createdAt, new Date(filters.endDate)));
  }

  // جستجوی متنی
  if (filters.search) {
    whereConditions.push(
      sql`(${auditLogs.event} ILIKE ${`%${filters.search}%`} 
           OR ${auditLogs.entityType} ILIKE ${`%${filters.search}%`}
           OR ${auditLogs.action} ILIKE ${`%${filters.search}%`})`
    );
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const logs = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userName: users.name,
      event: auditLogs.event,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldValue: auditLogs.oldValue,
      newValue: auditLogs.newValue,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(whereClause);

  return {
    data: logs as AuditLog[],
    total: Number(totalCount),
    page,
    pageSize,
  };
}