// src/app/[locale]/(main)/dashboard/[section]/page.tsx
import { notFound } from 'next/navigation';
import DashboardPageWrapper from '@/components/layout/DashboardPageWrapper';
import DynamicDataTable from '@/components/ui/DynamicDataTable';

// Importهای جدولی
import { userColumns } from '@/features/user/table-config';
import { getAllUsers } from '@/features/user/actions';
import { getAuditLogs } from '@/features/audit/actions';
import { organizationColumns, fetchOrganizations } from '@/features/organization/table-config';

// Import کامپوننت‌های غیرجدولی (Server یا Client)
import AnalyticsContent from '@/features/analytics/components/AnalyticsContent';
import CoursesContent from '@/features/courses/components/CoursesContent';
import ProductsContent from '@/features/products/components/ProductsContent';
import TicketsContent from '@/features/tickets/components/TicketsContent';
import ProfileContent from '@/features/profile/components/ProfileContent';
import SettingsContent from '@/features/settings/components/SettingsContent';

// Importهای خاص Blog و Audit (Client Components)
import BlogContent from '@/features/blog/components/BlogContent';
import AuditLogsClient from '@/features/audit/components/AuditContent';

const titleMap: Record<string, string> = {
  users: 'مدیریت کاربران',
  audit: 'لاگ فعالیت‌ها',
  organization: 'سازمان و تیم',
  analytics: 'آمار و گزارش‌ها',
  courses: 'دوره‌های آموزشی',
  products: 'محصولات و فروشگاه',
  tickets: 'تیکت‌ها و پشتیبانی',
  blog: 'وبلاگ و محتوا',
  profile: 'پروفایل کاربری',
  settings: 'تنظیمات',
};

export default async function DynamicDashboardPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  // ==================== بخش‌های جدولی (Server-side) ====================
  if (section === 'users') {
    const data = await getAllUsers();
    return (
      <DashboardPageWrapper permissions={['users:read']} title={titleMap[section]}>
        <DynamicDataTable
          data={data}
          columns={userColumns as any}
          searchKey="email"
          placeholder="جستجو بر اساس ایمیل یا نام..."
        />
      </DashboardPageWrapper>
    );
  }

  if (section === 'audit') {
    const { data, total, page, pageSize } = await getAuditLogs({ page: 1, pageSize: 20 });

    return (
      <DashboardPageWrapper permissions={['audit:read']} title={titleMap[section]}>
        <AuditLogsClient
          initialData={data}
          initialTotal={total}
          initialPage={page}
          initialPageSize={pageSize}
        />
      </DashboardPageWrapper>
    );
  }

  if (section === 'organization') {
    const data = await fetchOrganizations();
    return (
      <DashboardPageWrapper permissions={['organization:manage']} title={titleMap[section]}>
        <DynamicDataTable
          data={data}
          columns={organizationColumns}
          searchKey="name"
          placeholder="جستجو بر اساس نام سازمان..."
        />
      </DashboardPageWrapper>
    );
  }

  // ==================== بخش Blog (Client Component) ====================
  if (section === 'blog') {
    return (
      <DashboardPageWrapper permissions={['blog:read']} title={titleMap[section]}>
        <BlogContent />
      </DashboardPageWrapper>
    );
  }

  // ==================== سایر بخش‌های غیرجدولی ====================
  const contentMap: Record<string, React.ComponentType> = {
    analytics: AnalyticsContent,
    courses: CoursesContent,
    products: ProductsContent,
    tickets: TicketsContent,
    profile: ProfileContent,
    settings: SettingsContent,
  };

  const ContentComponent = contentMap[section];
  if (ContentComponent) {
    return (
      <DashboardPageWrapper
        permissions={section === 'profile' ? null : ['settings:write']}
        title={titleMap[section]}
      >
        <ContentComponent />
      </DashboardPageWrapper>
    );
  }

  notFound();
}