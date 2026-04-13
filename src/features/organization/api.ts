'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { organizations, organizationMembers } from '@/lib/db/schema';
import { logAuditEvent } from '@/features/audit/api';
import { createCachedQuery } from '@/lib/cache/cache';
import { AppError } from '@/lib/error/error';


// =============================================
// Schema Validation
// =============================================

const createOrganizationSchema = z.object({
  name: z.string().min(3, 'نام سازمان باید حداقل ۳ کاراکتر باشد').max(100),
  slug: z
    .string()
    .min(3, 'شناسه (slug) باید حداقل ۳ کاراکتر باشد')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'شناسه فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد')
    .optional(),
});

const updateOrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).max(100).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
});

// =============================================
// Types
// =============================================

export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
};

export type OrganizationWithMembers = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  membersCount: number;
  role: 'owner' | 'admin' | 'member';
};

// =============================================
// Queries (با Cache)
// =============================================

/**
 * دریافت سازمان‌های کاربر فعلی (کش شده)
 */
export const getUserOrganizations = createCachedQuery(
  async (userId: string): Promise<UserOrganization[]> => {
    const result = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        role: organizationMembers.role,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizations.id, organizationMembers.organizationId)
      )
      .where(eq(organizationMembers.userId, userId));

    return result as UserOrganization[];
  },
  ['user-organizations'],
  { revalidate: 300 } // کش برای ۵ دقیقه
);

/**
 * دریافت یک سازمان خاص با چک دسترسی
 */
export async function getOrganizationById(orgId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new AppError('احراز هویت نشده', 'UNAUTHORIZED', 401);

  const result = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      ownerId: organizations.ownerId,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      role: organizationMembers.role,
    })
    .from(organizations)
    .innerJoin(
      organizationMembers,
      eq(organizations.id, organizationMembers.organizationId)
    )
    .where(eq(organizations.id, orgId))
    .limit(1);

  const org = result[0];

  if (!org) throw new AppError('سازمان یافت نشد', 'ORGANIZATION_NOT_FOUND', 404);

  // چک دسترسی: فقط عضو سازمان می‌تواند آن را ببیند
  if (!org.role) {
    throw new AppError('شما دسترسی به این سازمان ندارید', 'FORBIDDEN', 403);
  }

  return org;
}

// =============================================
// Mutations (Server Actions)
// =============================================

/**
 * ایجاد سازمان جدید
 */
export async function createOrganization(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new AppError('ابتدا وارد حساب کاربری شوید', 'UNAUTHORIZED', 401);
  }

  const validated = createOrganizationSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  });

  if (!validated.success) {
    throw new AppError(
      validated.error.issues[0]?.message || 'داده‌های ورودی نامعتبر است',
      'VALIDATION_ERROR',
      400
    );
  }

  const { name, slug } = validated.data;
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    // چک وجود slug یکتا
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, finalSlug))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError('این شناسه (slug) قبلاً استفاده شده است', 'SLUG_EXISTS', 409);
    }

    // ایجاد سازمان
    const [newOrg] = await db
      .insert(organizations)
      .values({
        id: `org_${Date.now()}`,
        name,
        slug: finalSlug,
        ownerId: session.user.id,
      })
      .returning();

    // اضافه کردن کاربر به عنوان مالک
    await db.insert(organizationMembers).values({
      id: `mem_${Date.now()}`,
      organizationId: newOrg.id,
      userId: session.user.id,
      role: 'owner',
    });

    // ثبت در Audit Log
    await logAuditEvent({
      userId: session.user.id,
      action: 'organization.create',
      targetId: newOrg.id,
      targetType: 'organization',
      newValue: name,
    });

    // پاک کردن کش
    revalidatePath('/dashboard/organization');

    return {
      success: true,
      message: 'سازمان با موفقیت ایجاد شد',
      organization: newOrg,
    };
  } catch (error: any) {
    console.error('Create organization error:', error);

    if (error.message?.includes('unique') || error.code === 'SLUG_EXISTS') {
      throw new AppError('این نام یا شناسه قبلاً استفاده شده است', 'DUPLICATE', 409);
    }

    throw new AppError('ایجاد سازمان با مشکل مواجه شد', 'INTERNAL_ERROR', 500);
  }
}

/**
 * به‌روزرسانی سازمان (اختیاری - بعداً کامل می‌کنیم)
 */
export async function updateOrganization(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new AppError('احراز هویت نشده', 'UNAUTHORIZED', 401);

  const validated = updateOrganizationSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
  });

  if (!validated.success) {
    throw new AppError('داده‌های ورودی نامعتبر است', 'VALIDATION_ERROR', 400);
  }

  // منطق به‌روزرسانی را اینجا پیاده‌سازی کنید...
  throw new AppError('این قابلیت هنوز پیاده‌سازی نشده است', 'NOT_IMPLEMENTED', 501);
}

// =============================================
// حذف سازمان (با احتیاط)
// =============================================

export async function deleteOrganization(orgId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new AppError('احراز هویت نشده', 'UNAUTHORIZED', 401);

  // فقط مالک سازمان می‌تواند آن را حذف کند
  const org = await getOrganizationById(orgId);
  if (org.role !== 'owner') {
    throw new AppError('فقط مالک سازمان می‌تواند آن را حذف کند', 'FORBIDDEN', 403);
  }

  await db.delete(organizations).where(eq(organizations.id, orgId));

  await logAuditEvent({
    userId: session.user.id,
    action: 'organization.delete',
    targetId: orgId,
    targetType: 'organization',
  });

  revalidatePath('/dashboard/organization');

  return { success: true, message: 'سازمان با موفقیت حذف شد' };
}