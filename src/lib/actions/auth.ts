'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر است'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'نام حداقل ۲ کاراکتر است'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر است'),
});

// ==================== LOGIN WITH EMAIL ====================
export async function loginWithEmail(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || 'خطای اعتبارسنجی');
  }

  try {
    await auth.api.signInEmail({
      body: validated.data,
      headers: await headers(),
    });

    const headerList = await headers();
    const referer = headerList.get('referer') || '';
    const localeMatch = referer.match(/\/(fa|en)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'fa';

    redirect(`/${locale}/dashboard`);
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Login error:', error);

    // بهبود مدیریت خطا برای Better Auth
    const errorMessage = error.body?.message || error.message || '';

    if (errorMessage.includes('INVALID_EMAIL_OR_PASSWORD') || 
        errorMessage.includes('User not found') ||
        error.statusCode === 401) {
      
      throw new Error('ایمیل یا رمز عبور اشتباه است. اگر ثبت‌نام کرده‌اید، لطفاً ایمیل خود را تأیید کنید.');
    }

    throw new Error(error.message || 'خطا در ورود');
  }
}

// ==================== REGISTER WITH EMAIL ====================
export async function registerWithEmail(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || 'خطای اعتبارسنجی');
  }

  try {
    await auth.api.signUpEmail({
      body: {
        ...validated.data,
        // فیلدهای اضافی کاربر
        bio: '',
        phone: '',
        location: '',
        website: '',
      },
      headers: await headers(),
    });

    const headerList = await headers();
    const referer = headerList.get('referer') || '';
    const localeMatch = referer.match(/\/(fa|en)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'fa';

    redirect(`/${locale}/auth?message=check-email`);
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Register error:', error);

    if (error.statusCode === 422 || error.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
      throw new Error('این ایمیل قبلاً ثبت‌نام شده است. لطفاً از ایمیل دیگری استفاده کنید.');
    }

    // خطای اصلی بهتر نمایش داده شود
    throw new Error(error.message || error.body?.message || 'ثبت‌نام با مشکل مواجه شد');
  }
}
// ==================== SEND MAGIC LINK ====================
export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !z.string().email().safeParse(email).success) {
    throw new Error('ایمیل معتبر وارد کنید');
  }

  try {
    await auth.api.signInMagicLink({
      body: { email },
      headers: await headers(),
    });

    return { success: true, message: 'لینک ورود به ایمیل شما ارسال شد' };
  } catch (error: any) {
    console.error('Magic link error:', error);
    throw new Error(error.message || 'ارسال لینک ورود با مشکل مواجه شد');
  }
}

// ==================== REQUEST PASSWORD RESET ====================
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !z.string().email().safeParse(email).success) {
    throw new Error('ایمیل معتبر وارد کنید');
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: '/fa/auth?message=reset-success',
      },
      headers: await headers(),
    });

    return { success: true, message: 'لینک ریست رمز عبور به ایمیل شما ارسال شد' };
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw new Error(error.message || 'ارسال لینک ریست با مشکل مواجه شد');
  }
}