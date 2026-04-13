// src/lib/analytics/types.ts
export interface StatItem {
  title: string;
  value: string;
  change: string;
  iconName: string;      
  color: string;
}

export interface ChartDataPoint {
  name: string;
  revenue?: number;
  users?: number;
  enrollments?: number;
  conversion?: number;
}

export interface TopItem {
  id: string;
  title: string;
  value: number | string;
  change?: string;
}

export interface AnalyticsData {
  stats: StatItem[];
  revenueChart: ChartDataPoint[];
  userGrowthChart: ChartDataPoint[];
  topCourses: TopItem[];
  conversionFunnel: Array<{ stage: string; value: number; percentage: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    target: string;
    time: string;
  }>;
}

export interface AnalyticsFilters {
  period?: '7d' | '30d' | '90d' | 'year';
  startDate?: string;
  endDate?: string;
  organizationId?: string; // برای multi-tenant
}