// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',        // همیشه locale در URL باشد (بهترین برای SEO و consistency)
});

// مسیرهای خاص
const publicRoutes = ['/auth'];
const authRoutes = ['/auth'];           // مسیرهای لاگین/ثبت‌نام
const protectedRoutes = ['/dashboard'];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const locale = pathname.split('/')[1] || defaultLocale; // استخراج locale از URL

  logger.info('Middleware request', { method: req.method, pathname, locale });

  // ۱. اول next-intl middleware را اجرا کن (مدیریت locale)
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  // ۲. چک حفاظت مسیرهای داشبورد (protected)
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(`/${locale}${route}`) || 
    pathname.startsWith(route) // fallback اگر locale نبود
  );

  if (isProtectedRoute) {
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user) {
        logger.warn('Unauthorized access attempt', { pathname });
        
        // ریدایرکت به صفحه auth با همان locale فعلی
        const loginUrl = new URL(`/${locale}/auth`, req.url);
        return NextResponse.redirect(loginUrl);
      }

      // RBAC ساده — مسیرهای فقط ادمین
      const isAdminOnly = pathname.includes('/users') || 
                         pathname.includes('/audit') || 
                         pathname.includes('/organization');

      if (isAdminOnly && session.user.role !== 'admin') {
        logger.warn('Insufficient permissions', { userRole: session.user.role, pathname });
        const dashboardUrl = new URL(`/${locale}/dashboard`, req.url);
        return NextResponse.redirect(dashboardUrl);
      }

      logger.info('Access granted', { email: session.user.email, role: session.user.role });

    } catch (err) {
      logger.error('Middleware session check failed', err);
      const loginUrl = new URL(`/${locale}/auth`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ۳. اگر کاربر لاگین کرده و به صفحه auth آمد → به داشبورد بفرست
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(`/${locale}${route}`)
  );

  if (isAuthRoute) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user) {
        const dashboardUrl = new URL(`/${locale}/dashboard`, req.url);
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (err) {
      // اگر خطا بود، اجازه بده به صفحه auth برود
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // همه مسیرها به جز فایل‌های استاتیک و API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};