'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target 
} from 'lucide-react';

import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

import { useAnalytics } from '../hooks';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

// نقشه نام آیکون به کامپوننت واقعی با نوع مناسب
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users: Users,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  Target: Target,
};

export default function AnalyticsContent() {
  const { data, loading, error, refresh, filters, updateFilters } = useAnalytics({ 
    period: '30d' 
  });

  if (error) {
    return <div className="p-8 text-center text-red-500">خطا: {error}</div>;
  }

  const stats = data?.stats || [];
  const revenueData = data?.revenueChart || [];
  const growthData = data?.userGrowthChart || [];
  const topCourses = data?.topCourses || [];
  const funnel = data?.conversionFunnel || [];
  const activity = data?.recentActivity || [];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تحلیل عملکرد پلتفرم</h1>
          <p className="text-muted-foreground">داده‌های واقعی از پایگاه داده</p>
        </div>

        <div className="flex items-center gap-3">
          <Select 
            value={filters.period || '30d'} 
            onValueChange={(v: any) => updateFilters({ period: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">۷ روز اخیر</SelectItem>
              <SelectItem value="30d">۳۰ روز اخیر</SelectItem>
              <SelectItem value="90d">۹۰ روز اخیر</SelectItem>
              <SelectItem value="year">یک سال</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={refresh} 
            disabled={loading} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const isPositive = stat.change.startsWith('+');
          
          // انتخاب آیکون با نوع امن
          const IconComponent = iconMap[stat.iconName] || Users;

          return (
            <Card key={i} className="hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {stat.change} نسبت به دوره قبل
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* نمودارهای اصلی */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> روند درآمد
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(v) => {
                    const value = v ?? 0;
                    return [`${value.toLocaleString('fa-IR')} تومان`, 'درآمد'];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> رشد کاربران
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>دوره‌های برتر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((course, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">{course.title}</div>
                  <div className="font-bold text-emerald-600">
                    {course.value.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قیف تبدیل</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie 
                  data={funnel} 
                  dataKey="value" 
                  nameKey="stage" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={90}
                >
                  {funnel.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              {funnel.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.stage}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> فعالیت‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity.map((act, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{act.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {act.user} • {act.target}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">{act.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}