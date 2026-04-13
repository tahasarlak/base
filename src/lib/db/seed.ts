// src/lib/seed.ts
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function runInitialSeed() {
  try {
    const emails = [
      { email: 'super@universal.com', role: 'super_admin', name: 'مالک اصلی' },
      { email: 'admin@universal.com', role: 'admin', name: 'مدیر کل' },
      { email: 'instructor@universal.com', role: 'instructor', name: 'دکتر احمدی' },
      { email: 'seller@universal.com', role: 'seller', name: 'فروشنده حرفه‌ای' },
      { email: 'blogger@universal.com', role: 'blogger', name: 'محتوا نویس' },
      { email: 'support@universal.com', role: 'support', name: 'پشتیبانی' },
      { email: 'student@universal.com', role: 'student', name: 'دانشجو نمونه' },
      { email: 'user@universal.com', role: 'user', name: 'کاربر عادی' },
    ];

    for (const item of emails) {
      const existing = await db.select().from(users).where(eq(users.email, item.email)).limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          id: `seed_${item.role}_${Date.now()}`,
          name: item.name,
          email: item.email,
          role: item.role as any,
          emailVerified: true,
        });
        logger.info(`✅ Created user: ${item.email} (${item.role})`);
      }
    }

    logger.info('🎉 Initial seeding completed successfully');
  } catch (error) {
    logger.error('Seed failed', error);
  }
}