'use client';

import Header from '@/components/common/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useTranslations } from 'next-intl';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const t = useTranslations('Dashboard');

  // نام کاربر - فعلاً ثابت (بعداً از auth context می‌گیریم)
  const userName = "علی";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            
            {/* خوش آمدی */}
            <div className="mb-8">
             <p className="text-xl text-muted-foreground">
            {t('welcome', { name: userName }) || `خوش آمدید، ${userName}👋`}
  👋
            </p>
            </div>

            {/* محتوای صفحه‌های داخل داشبورد */}
            <div className="min-h-[calc(100vh-220px)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}