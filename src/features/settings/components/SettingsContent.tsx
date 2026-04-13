'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsContent() {
  return (
    <div className="max-w-4xl space-y-10">
      {/* پروفایل */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            اطلاعات پروفایل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">نام کامل</Label>
              <Input id="name" placeholder="نام و نام خانوادگی" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" type="email" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">درباره من</Label>
            <Textarea id="bio" placeholder="توضیح کوتاه درباره خودتان" rows={4} />
          </div>

          <Button>ذخیره تغییرات</Button>
        </CardContent>
      </Card>

      {/* اعلان‌ها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            تنظیمات اعلان‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">اعلان‌های ایمیل</p>
              <p className="text-sm text-muted-foreground">دریافت اعلان‌های مهم از طریق ایمیل</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">اعلان‌های داخل برنامه</p>
              <p className="text-sm text-muted-foreground">نمایش نوتیفیکیشن داخل داشبورد</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* امنیت */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            امنیت حساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">تغییر رمز عبور</Button>
          <Button variant="outline" className="w-full justify-start">فعال‌سازی احراز هویت دو مرحله‌ای</Button>
        </CardContent>
      </Card>

      {/* ظاهر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Palette className="h-5 w-5" />
            ظاهر و زبان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تم تاریک</p>
              <p className="text-sm text-muted-foreground">استفاده از حالت تاریک</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}