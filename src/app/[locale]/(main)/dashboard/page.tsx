import { getServerSession } from '@/lib/auth/get-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/features/SkeletonLoader';

const stats = [
  { title: 'کاربران فعال', value: '۱٬۲۴۸', change: '+۱۲٪', icon: Users, color: 'text-blue-500' },
  { title: 'درآمد این ماه', value: '۸۹ میلیون تومان', change: '+۸٪', icon: DollarSign, color: 'text-emerald-500' },
  { title: 'فعالیت امروز', value: '۶۷', change: '-۳٪', icon: Activity, color: 'text-amber-500' },
  { title: 'رشد کلی', value: '۲۴٪', change: '+۵٪', icon: TrendingUp, color: 'text-violet-500' },
];

async function StatsCards() {
  // شبیه‌سازی داده واقعی + کشینگ
  await new Promise(r => setTimeout(r, 600));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
            <p className="text-xs text-emerald-500 mt-1">{stat.change} نسبت به ماه قبل</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return null; // layout خودش ریدایرکت می‌کند
  }

  const userName = session.user.name || session.user.email?.split('@')[0] || 'کاربر';

  return (
      <Suspense fallback={<DashboardSkeleton />}>
        <StatsCards />
      </Suspense>
  );
}