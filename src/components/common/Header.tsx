'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, LayoutDashboard, Settings, Home } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import LanguageSwitcher from './LanguageSwitcher';
import { useSession } from '@/hooks/use-session';
import { useUserRole } from '@/hooks/use-user-role';

export default function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { data: sessionData, isLoading } = useSession();
  const { role, isSuperAdmin, isAdmin } = useUserRole();

  const user = sessionData?.user;

  // ساخت لینک کامل با locale
  const getFullHref = (href: string) => `/${locale}${href}`;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success(t('signOutSuccess') || 'با موفقیت خارج شدید');
      window.location.href = `/${locale}/auth`;
    } catch (err: any) {
      toast.error(t('signOutError') || 'خطا در خروج از حساب');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={getFullHref('/dashboard')} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl transition-all group-hover:scale-110 duration-300">
            U
          </div>
          <div>
            <div className="font-semibold text-2xl tracking-tighter text-foreground">
              Universal
            </div>
            <div className="text-[10px] text-muted-foreground -mt-1">Enterprise Platform</div>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-background ring-border hover:ring-primary/50 transition-all"
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={user.image || ''} 
                      alt={user.name || 'کاربر'} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.name?.slice(0, 2).toUpperCase() ||
                       user.email?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 glass border border-border/50 shadow-2xl"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'کاربر عزیز'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium capitalize">
                      {role === 'super_admin' ? 'مالک اصلی' :
                       role === 'admin' ? 'مدیر سیستم' :
                       role === 'instructor' ? 'استاد' :
                       role === 'seller' ? 'فروشنده' :
                       role === 'blogger' ? 'وبلاگ‌نویس' :
                       role === 'support' ? 'پشتیبانی' :
                       role === 'student' ? 'دانشجو' : 'کاربر'}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href={getFullHref('/dashboard')} className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    داشبورد
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={getFullHref('/dashboard/profile')} className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    پروفایل
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={getFullHref('/dashboard/settings')} className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    تنظیمات
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  خروج از حساب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}