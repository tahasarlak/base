import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // اگر locale نامعتبر بود، پیش‌فرض فارسی
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // مسیر مطلق با @/ (بهترین روش برای src directory)
  const messages = (await import(`@/locales/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});