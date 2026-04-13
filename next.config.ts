import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  // مسیر دقیق به request.ts
  experimental: {
    // اگر Turbopack داری و مشکل دادی، این رو اضافه کن
  },
});

const nextConfig: NextConfig = {
  // تنظیمات دیگه‌ات رو اینجا نگه دار
};

export default withNextIntl(nextConfig);