// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';   // ← تغییر مهم اینجا
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import QueryProvider from '@/components/providers/QueryProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n/config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Universal Next.js Starter',
  description: 'بهترین boilerplate حرفه‌ای Next.js 15 با فارسی + انگلیسی',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as any) ? locale : defaultLocale;
  const messages = await getMessages({ locale: validLocale });

  return (
    <html 
      lang={validLocale} 
      dir={validLocale === 'fa' ? 'rtl' : 'ltr'} 
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NextIntlClientProvider messages={messages} locale={validLocale}>
              {children}
            </NextIntlClientProvider>
          </QueryProvider>

          <Toaster
            position="top-center"
            richColors
            closeButton
            className="rtl:right-auto rtl:left-0"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}