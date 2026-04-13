'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { formatDate } from '@/lib/utils';

export default function ProfileContent() {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    super_admin: 'مالک اصلی پلتفرم',
    admin: 'مدیر کل سیستم',
    instructor: 'استاد و مدرس',
    seller: 'فروشنده محصولات',
    blogger: 'نویسنده محتوا',
    support: 'پشتیبان و تیکت',
    student: 'دانشجو',
    customer: 'مشتری',
    user: 'کاربر عادی',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card>
        <CardContent className="pt-10 pb-12">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 border-4 border-background shadow-2xl mb-6">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback className="text-5xl bg-primary/10 text-primary">
                {user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-4xl font-bold mb-2">{user.name || 'کاربر عزیز'}</h1>
            <p className="text-xl text-muted-foreground mb-4">{user.email}</p>

            <Badge variant="default" className="text-base px-6 py-1.5">
              {roleLabels[user.role] || user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5" /> اطلاعات شخصی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">نام کامل</p>
              <p className="font-medium">{user.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ایمیل</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-5 w-5" /> وضعیت حساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">نقش فعلی</p>
              <p className="font-medium capitalize">{user.role.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عضویت از</p>
              <p className="font-medium">{formatDate(new Date())}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}