'use server';

import { db } from '@/lib/db';
import { users, courses, enrollments } from '@/lib/db/schema';
import { desc, sql, eq, gte, count, and, lt } from 'drizzle-orm';
import { AnalyticsData, AnalyticsFilters } from './types';

export async function getAnalyticsData(
  filters: AnalyticsFilters = {}
): Promise<AnalyticsData> {
  const now = new Date();
  let currentStart = new Date(now);
  let previousStart = new Date(now);

  // تعیین بازه فعلی و قبلی
  switch (filters.period) {
    case '7d':
      currentStart.setDate(now.getDate() - 7);
      previousStart.setDate(now.getDate() - 14);
      break;
    case '30d':
      currentStart.setDate(now.getDate() - 30);
      previousStart.setDate(now.getDate() - 60);
      break;
    case '90d':
      currentStart.setDate(now.getDate() - 90);
      previousStart.setDate(now.getDate() - 180);
      break;
    case 'year':
      currentStart.setFullYear(now.getFullYear() - 1);
      previousStart.setFullYear(now.getFullYear() - 2);
      break;
    default:
      currentStart.setDate(now.getDate() - 30);
      previousStart.setDate(now.getDate() - 60);
  }

  // ── آمار فعلی ──
  const [totalUsersCurrent] = await db.select({ 
    count: sql<number>`count(*)` 
  }).from(users);

  const [revenueCurrent] = await db.select({
    sum: sql<number>`COALESCE(SUM(${enrollments.amountPaid}), 0)`
  }).from(enrollments).where(gte(enrollments.enrolledAt, currentStart));

  const [enrollmentsCurrent] = await db.select({
    count: sql<number>`count(*)`
  }).from(enrollments).where(gte(enrollments.enrolledAt, currentStart));

  const [conversionCurrent] = await db.select({
    paid: sql<number>`COALESCE(COUNT(CASE WHEN ${enrollments.paymentStatus} = 'paid' THEN 1 END), 0)`,
    total: sql<number>`COUNT(*)`
  }).from(enrollments).where(gte(enrollments.enrolledAt, currentStart));

  const currentConversionRate = conversionCurrent.total
    ? (conversionCurrent.paid / conversionCurrent.total) * 100
    : 0;

  // ── آمار دوره قبلی ──
  const [usersPrevious] = await db.select({ 
    count: sql<number>`count(*)` 
  }).from(users).where(
    and(
      gte(users.createdAt, previousStart),
      lt(users.createdAt, currentStart)
    )
  );

  const [revenuePrevious] = await db.select({
    sum: sql<number>`COALESCE(SUM(${enrollments.amountPaid}), 0)`
  })
    .from(enrollments)
    .where(and(
      gte(enrollments.enrolledAt, previousStart),
      lt(enrollments.enrolledAt, currentStart)
    ));

  const [enrollmentsPrevious] = await db.select({
    count: sql<number>`count(*)`
  })
    .from(enrollments)
    .where(and(
      gte(enrollments.enrolledAt, previousStart),
      lt(enrollments.enrolledAt, currentStart)
    ));

  const [conversionPrevious] = await db.select({
    paid: sql<number>`COALESCE(COUNT(CASE WHEN ${enrollments.paymentStatus} = 'paid' THEN 1 END), 0)`,
    total: sql<number>`COUNT(*)`
  })
    .from(enrollments)
    .where(and(
      gte(enrollments.enrolledAt, previousStart),
      lt(enrollments.enrolledAt, currentStart)
    ));

  const previousConversionRate = conversionPrevious.total
    ? (conversionPrevious.paid / conversionPrevious.total) * 100
    : 0;

  // ── محاسبه درصد تغییر (همه واقعی از دیتابیس) ──
  const usersChange = usersPrevious.count > 0
    ? Math.round(((totalUsersCurrent.count - usersPrevious.count) / usersPrevious.count) * 100)
    : 0;

  const revenueChange = revenuePrevious.sum > 0
    ? Math.round(((revenueCurrent.sum - revenuePrevious.sum) / revenuePrevious.sum) * 100)
    : 0;

  const enrollmentsChange = enrollmentsPrevious.count > 0
    ? Math.round(((enrollmentsCurrent.count - enrollmentsPrevious.count) / enrollmentsPrevious.count) * 100)
    : 0;

  const conversionChange = previousConversionRate > 0
    ? Math.round(((currentConversionRate - previousConversionRate) / previousConversionRate) * 100)
    : 0;

  const stats = [
    {
      title: 'کاربران فعال',
      value: totalUsersCurrent.count.toLocaleString('fa-IR'),
      change: `${usersChange >= 0 ? '+' : ''}${usersChange}٪`,
      iconName: 'Users',
      color: 'text-blue-500'
    },
    {
      title: 'درآمد کل',
      value: `${revenueCurrent.sum.toLocaleString('fa-IR')} تومان`,
      change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}٪`,
      iconName: 'DollarSign',
      color: 'text-emerald-500'
    },
    {
      title: 'ثبت‌نام جدید',
      value: enrollmentsCurrent.count.toLocaleString('fa-IR'),
      change: `${enrollmentsChange >= 0 ? '+' : ''}${enrollmentsChange}٪`,
      iconName: 'TrendingUp',
      color: 'text-violet-500'
    },
    {
      title: 'نرخ تبدیل',
      value: `${currentConversionRate.toFixed(1)}٪`,
      change: `${conversionChange >= 0 ? '+' : ''}${conversionChange}٪`,
      iconName: 'Target',
      color: 'text-amber-500'
    },
  ];

  // بقیه بخش‌ها (Revenue Chart, User Growth, Top Courses, Conversion Funnel, Recent Activity)
  const revenueData = await db
    .select({
      name: sql<string>`TO_CHAR(date_trunc('month', ${enrollments.enrolledAt}), 'YYYY-MM')`,
      revenue: sql<number>`COALESCE(SUM(${enrollments.amountPaid}), 0)`,
    })
    .from(enrollments)
    .where(gte(enrollments.enrolledAt, currentStart))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const userGrowthData = await db
    .select({
      name: sql<string>`TO_CHAR(date_trunc('week', ${users.createdAt}), 'YYYY-MM-DD')`,
      users: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(gte(users.createdAt, currentStart))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const topCoursesRaw = await db
    .select({
      id: courses.id,
      title: courses.title,
      value: sql<number>`COALESCE(SUM(${enrollments.amountPaid}), 0)`,
    })
    .from(courses)
    .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
    .where(gte(enrollments.enrolledAt, currentStart))
    .groupBy(courses.id, courses.title)
    .orderBy(desc(sql`COALESCE(SUM(${enrollments.amountPaid}), 0)`))
    .limit(5);

  const topCourses = topCoursesRaw.map(c => ({
    id: c.id,
    title: c.title,
    value: Number(c.value),
  }));

  const funnelData = await db
    .select({ status: enrollments.status, count: count() })
    .from(enrollments)
    .where(gte(enrollments.enrolledAt, currentStart))
    .groupBy(enrollments.status);

  const totalEnroll = funnelData.reduce((sum, item) => sum + Number(item.count), 0) || 1;

  const conversionFunnel = [
    { stage: 'ثبت‌نام', value: totalEnroll, percentage: 100 },
    {
      stage: 'در حال پیشرفت',
      value: Number(funnelData.find(f => f.status === 'active')?.count || 0),
      percentage: Math.round((Number(funnelData.find(f => f.status === 'active')?.count || 0) / totalEnroll) * 100)
    },
    {
      stage: 'تکمیل شده',
      value: Number(funnelData.find(f => f.status === 'completed')?.count || 0),
      percentage: Math.round((Number(funnelData.find(f => f.status === 'completed')?.count || 0) / totalEnroll) * 100)
    },
  ];

  const recentActivity = await db
    .select({
      id: enrollments.id,
      action: sql<string>`'ثبت‌نام در دوره'`,
      user: sql<string>`COALESCE(${users.name}, 'کاربر ناشناس')`,
      target: sql<string>`COALESCE(${courses.title}, 'دوره نامشخص')`,
      time: sql<string>`TO_CHAR(${enrollments.enrolledAt}, 'HH24:MI')`,
    })
    .from(enrollments)
    .leftJoin(users, eq(enrollments.userId, users.id))
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .orderBy(desc(enrollments.enrolledAt))
    .limit(8);

  return {
    stats,
    revenueChart: revenueData,
    userGrowthChart: userGrowthData,
    topCourses,
    conversionFunnel,
    recentActivity,
  };
}