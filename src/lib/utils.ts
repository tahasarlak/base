import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// فرمت‌کننده‌ها
export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

export const formatNumber = (num: number) => new Intl.NumberFormat('fa-IR').format(num);
// فرمت‌کننده قیمت (با جداکننده هزارگان فارسی)
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null || isNaN(price)) return '۰ تومان';

  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};