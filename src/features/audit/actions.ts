// src/features/audit/actions.ts
'use server';

import { db } from '@/lib/db';
import { users, auditLogs } from '@/lib/db/schema';
import { desc, sql, eq, gte, lt, and, count } from 'drizzle-orm';
import { AuditLog, AuditFilters } from './types';

export async function getAuditLogs(filters: AuditFilters = {}): Promise<{
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;

  let whereConditions: any[] = [];

  if (filters.action) whereConditions.push(eq(auditLogs.action, filters.action));
  if (filters.targetType) whereConditions.push(eq(auditLogs.targetType, filters.targetType));
  if (filters.userId) whereConditions.push(eq(auditLogs.userId, filters.userId));
  if (filters.startDate) whereConditions.push(gte(auditLogs.createdAt, new Date(filters.startDate)));
  if (filters.endDate) whereConditions.push(lt(auditLogs.createdAt, new Date(filters.endDate)));
  if (filters.search) {
    whereConditions.push(
      sql`(${auditLogs.action} ILIKE ${`%${filters.search}%`} OR 
           ${auditLogs.targetType} ILIKE ${`%${filters.search}%`})`
    );
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // دریافت لاگ‌ها + نام کاربر
  const logs = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userName: users.name,
      action: auditLogs.action,
      targetId: auditLogs.targetId,
      targetType: auditLogs.targetType,
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

  // تعداد کل
  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(whereClause);

  return {
    data: logs as AuditLog[],
    total: Number(totalCount),
    page,
    pageSize,
  };
}