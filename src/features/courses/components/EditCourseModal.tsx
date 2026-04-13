'use client';

import { useState, useEffect } from 'react';
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
import { updateCourse } from '../actions';
import type { CourseWithRelations } from '../types';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: CourseWithRelations | null;
}

export default function EditCourseModal({
  isOpen,
  onClose,
  onSuccess,
  course,
}: EditCourseModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    discountPrice: undefined as number | undefined,
    duration: undefined as number | undefined,
    level: 'beginner',
    thumbnail: '',
    isPublished: false,
    isFree: false,
    maxStudents: undefined as number | undefined,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        id: course.id,
        title: course.title,
        description: course.description || '',
        categoryId: course.categoryId || '',
        price: course.price ?? 0,                    // ← رفع ارور null
        discountPrice: course.discountPrice ?? undefined,
        duration: course.duration ?? undefined,
        level: course.level || 'beginner',
        thumbnail: course.thumbnail || '',
        isPublished: course.isPublished ?? false,
        isFree: course.isFree ?? false,
        maxStudents: course.maxStudents ?? undefined,
      });
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || formData.price <= 0) return;

    setLoading(true);

    try {
      await updateCourse({
        id: formData.id,
        title: formData.title,
        description: formData.description || null,
        categoryId: formData.categoryId || null,
        price: formData.price,
        discountPrice: formData.discountPrice ?? null,
        duration: formData.duration ?? null,
        level: formData.level,
        thumbnail: formData.thumbnail || null,
        isPublished: formData.isPublished,
        isFree: formData.isFree,
        maxStudents: formData.maxStudents ?? null,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || 'خطا در ویرایش دوره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش دوره</DialogTitle>
          <DialogDescription>اطلاعات دوره را به‌روزرسانی کنید.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>عنوان دوره *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>دسته‌بندی</Label>
              <Select 
                value={formData.categoryId || ''} 
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">برنامه‌نویسی</SelectItem>
                  <SelectItem value="design">طراحی</SelectItem>
                  <SelectItem value="marketing">بازاریابی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>سطح</Label>
              <Select 
                value={formData.level} 
                onValueChange={(val) => setFormData({ ...formData, level: val })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>قیمت با تخفیف</Label>
              <Input
                type="number"
                value={formData.discountPrice ?? ''}
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    discountPrice: e.target.value ? parseInt(e.target.value) : undefined 
                  })
                }
              />
            </div>

            <div>
              <Label>مدت زمان (ساعت)</Label>
              <Input
                type="number"
                value={formData.duration ?? ''}
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    duration: e.target.value ? parseInt(e.target.value) : undefined 
                  })
                }
              />
            </div>

            <div>
              <Label>حداکثر ظرفیت</Label>
              <Input
                type="number"
                value={formData.maxStudents ?? ''}
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    maxStudents: e.target.value ? parseInt(e.target.value) : undefined 
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isPublished} 
                onCheckedChange={(c) => setFormData({ ...formData, isPublished: c })} 
              />
              <Label>منتشر شده</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isFree} 
                onCheckedChange={(c) => setFormData({ ...formData, isFree: c })} 
              />
              <Label>رایگان</Label>
            </div>
          </div>

          <div>
            <Label>توضیحات دوره</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows={6} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}