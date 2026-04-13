'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createCourse } from '../actions';
import type { CreateCourseInput } from '../types';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewCourseModal({
  isOpen,
  onClose,
  onSuccess,
}: NewCourseModalProps) {
  const [formData, setFormData] = useState<CreateCourseInput>({
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    discountPrice: undefined,
    duration: undefined,
    level: 'beginner',
    thumbnail: '',
    isPublished: false,
    isFree: false,
    maxStudents: undefined,
    prerequisites: null,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.price <= 0) return;

    setLoading(true);

    try {
      await createCourse(formData);
      onSuccess();
      onClose();
      // ریست فرم
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        price: 0,
        discountPrice: undefined,
        duration: undefined,
        level: 'beginner',
        thumbnail: '',
        isPublished: false,
        isFree: false,
        maxStudents: undefined,
        prerequisites: null,
      });
    } catch (error: any) {
      alert(error.message || 'خطا در ایجاد دوره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ایجاد دوره آموزشی جدید</DialogTitle>
          <DialogDescription>
            لطفاً اطلاعات پایه دوره را وارد کنید. بعداً می‌توانید ماژول‌ها و درس‌ها را اضافه کنید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>عنوان دوره *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: آموزش کامل Next.js 16 و App Router"
                required
              />
            </div>

            <div>
              <Label>دسته‌بندی</Label>
              <Select value={formData.categoryId || ''} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">برنامه‌نویسی</SelectItem>
                  <SelectItem value="design">طراحی و گرافیک</SelectItem>
                  <SelectItem value="marketing">بازاریابی دیجیتال</SelectItem>
                  <SelectItem value="business">کسب‌وکار</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>سطح دوره</Label>
              <Select value={formData.level} onValueChange={(val) => setFormData({ ...formData, level: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">مبتدی</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">پیشرفته</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>قیمت (تومان) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>قیمت با تخفیف (تومان)</Label>
              <Input
                type="number"
                value={formData.discountPrice || ''}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label>مدت زمان دوره (ساعت)</Label>
              <Input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label>حداکثر تعداد دانشجو</Label>
              <Input
                type="number"
                value={formData.maxStudents || ''}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
              <Label>منتشر شده</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
              />
              <Label>دوره کاملاً رایگان</Label>
            </div>
          </div>

          <div>
            <Label>توضیحات دوره</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              placeholder="توضیحات کامل و جذاب دوره را بنویسید..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim() || formData.price <= 0}>
              {loading ? 'در حال ایجاد دوره...' : 'ایجاد دوره'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}