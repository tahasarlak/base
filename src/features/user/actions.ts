'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth/get-session';

// گرفتن لیست کاربران (فقط برای ادمین و بالاتر)
export async function getAllUsers() {
  const session = await getServerSession();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    throw new Error('دسترسی ندارید');
  }

  try {
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: {
        limit: 100,
      },
    });

    // اصلاح نوع بازگشت (طبق ساختار Better Auth)
    return result.users || [];
  } catch (error: any) {
    console.error('List users error:', error);
    throw new Error('خطا در دریافت لیست کاربران');
  }
}

// تغییر نقش کاربر
export async function changeUserRole(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    throw new Error('فقط ادمین می‌تواند نقش تغییر دهد');
  }

  const userId = formData.get('userId') as string;
  const newRole = formData.get('newRole') as string;

  if (!userId || !newRole) {
    throw new Error('اطلاعات ناقص است');
  }

  // جلوگیری از تغییر نقش super_admin توسط ادمین معمولی
  if (newRole === 'super_admin' && session.user.role !== 'super_admin') {
    throw new Error('فقط super_admin می‌تواند نقش super_admin بدهد');
  }

  try {
    await auth.api.setRole({
      body: { 
        userId, 
        role: newRole as any   // برای رفع مشکل نوع محدود Better Auth
      },
      headers: await headers(),
    });

    // revalidate همه مسیرهای داشبورد کاربران (بهتر کار می‌کند)
    revalidatePath('/[locale]/dashboard/users');
    revalidatePath('/fa/dashboard/users');
    revalidatePath('/en/dashboard/users');

    return { success: true };
  } catch (error: any) {
    console.error('Set role error:', error);
    throw new Error(error.message || 'تغییر نقش با مشکل مواجه شد');
  }
}