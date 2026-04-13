'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  Shield,
  BookOpen,
  ShoppingBag,
  Ticket,
  LogOut
} from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import { usePermissions } from '@/features/permission/hooks/use-permissions';
import { useSession } from '@/hooks/use-session';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permissions?: string[];
  roles?: string[];
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },

  { href: '/dashboard/users', label: 'مدیریت کاربران', icon: Users, roles: ['super_admin', 'admin'] },
  { href: '/dashboard/organization', label: 'سازمان و تیم', icon: Building2, roles: ['super_admin', 'admin'] },
  { href: '/dashboard/audit', label: 'لاگ فعالیت‌ها', icon: Shield, roles: ['super_admin', 'admin'] },

  { href: '/dashboard/courses', label: 'دوره‌های آموزشی', icon: BookOpen, roles: ['super_admin', 'admin', 'instructor'] },
  { href: '/dashboard/products', label: 'محصولات', icon: ShoppingBag, roles: ['super_admin', 'admin', 'seller'] },
  { href: '/dashboard/blog', label: 'وبلاگ', icon: BookOpen, roles: ['super_admin', 'admin', 'blogger'] },
  { href: '/dashboard/tickets', label: 'تیکت و پشتیبانی', icon: Ticket, roles: ['super_admin', 'admin', 'support'] },

  { href: '/dashboard/analytics', label: 'آمار و گزارش‌ها', icon: BarChart3, roles: ['super_admin', 'admin', 'instructor', 'seller'] },
  { href: '/dashboard/settings', label: 'تنظیمات', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const { role } = useUserRole();
  const { hasAnyPermission } = usePermissions();
  const { data: sessionData } = useSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success('با موفقیت خارج شدید');
      window.location.href = `/${locale}/auth`;
    } catch {
      toast.error('خطا در خروج از حساب');
    }
  };

  // فیلتر هوشمند منوها
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles && !item.permissions) return true;
    
    if (item.roles?.includes(role || '')) return true;
    if (item.permissions) return hasAnyPermission(item.permissions as any);

    return false;
  });

  const isActive = (href: string) => 
    pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`);

  const getHref = (href: string) => `/${locale}${href}`;

  return (
    <div className="border-l border-border bg-card h-full flex flex-col w-72 shadow-xl">
      {/* Logo */}
      <div className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
            U
          </div>
          <div>
            <div className="font-semibold text-xl tracking-tighter">Universal</div>
            <div className="text-xs text-muted-foreground -mt-1">Enterprise</div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const href = getHref(item.href);
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-accent hover:text-foreground text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t mt-auto">
        {sessionData?.user && (
          <div className="mb-4 px-4 py-3 bg-muted/60 rounded-2xl">
            <div className="text-xs text-muted-foreground">وارد شده به عنوان</div>
            <div className="font-medium truncate">
              {sessionData.user.name || sessionData.user.email?.split('@')[0]}
            </div>
            <div className="text-[10px] text-emerald-600 capitalize">
              {role?.replace('_', ' ')}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          خروج از حساب
        </Button>
      </div>
    </div>
  );
}