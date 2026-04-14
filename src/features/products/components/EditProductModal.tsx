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
import { updateProduct } from '../actions';
import type { Product, UpdateProductInput } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: EditProductModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [type, setType] = useState<Product['type']>('digital');
  const [status, setStatus] = useState<Product['status']>('draft');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  // پر کردن فرم هنگام باز شدن مدال
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setSubtitle(product.subtitle || '');
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setDiscountPrice(product.discountPrice?.toString() || '');
      setCompareAtPrice(product.compareAtPrice?.toString() || '');
      setType(product.type);
      setStatus(product.status);
      setStock(product.stock?.toString() || '0');
      setIsFeatured(product.isFeatured || false);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !title.trim()) return;

    setLoading(true);

    try {
      const updateData: UpdateProductInput = {
        id: product.id,
        title,
        subtitle: subtitle || null,
        shortDescription: shortDescription || null,
        description: description || null,
        price: parseInt(price),
        discountPrice: discountPrice ? parseInt(discountPrice) : null,
        compareAtPrice: compareAtPrice ? parseInt(compareAtPrice) : null,
        type,
        status,
        stock: parseInt(stock),
        isFeatured,
      };

      await updateProduct(updateData);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.message || 'خطا در ویرایش محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش محصول</DialogTitle>
          <DialogDescription>
            اطلاعات محصول را به‌روزرسانی کنید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* عنوان */}
            <div className="md:col-span-2">
              <Label htmlFor="title">عنوان محصول *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* ساب‌تایتل */}
            <div className="md:col-span-2">
              <Label htmlFor="subtitle">عنوان فرعی</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="عنوان کوتاه یا شعار محصول"
              />
            </div>

            {/* نوع محصول */}
            <div>
              <Label>نوع محصول *</Label>
              <Select value={type} onValueChange={(val: Product['type']) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">دیجیتال</SelectItem>
                  <SelectItem value="physical">فیزیکی</SelectItem>
                  <SelectItem value="course">دوره آموزشی</SelectItem>
                  <SelectItem value="subscription">اشتراکی</SelectItem>
                  <SelectItem value="service">خدمات</SelectItem>
                  <SelectItem value="bundle">باندل / پکیج</SelectItem>
                  <SelectItem value="ticket">بلیت رویداد</SelectItem>
                  <SelectItem value="membership">عضویت</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* وضعیت */}
            <div>
              <Label>وضعیت *</Label>
              <Select value={status} onValueChange={(val: Product['status']) => setStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                  <SelectItem value="published">منتشر شده</SelectItem>
                  <SelectItem value="scheduled">زمان‌بندی شده</SelectItem>
                  <SelectItem value="archived">بایگانی</SelectItem>
                  <SelectItem value="out_of_stock">تمام شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* قیمت‌ها */}
            <div>
              <Label>قیمت (تومان) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>قیمت با تخفیف</Label>
              <Input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
              />
            </div>

            <div>
              <Label>قیمت مقایسه‌ای (قبل از تخفیف)</Label>
              <Input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
              />
            </div>

            <div>
              <Label>موجودی</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
              />
            </div>

            {/* محصول ویژه */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                نمایش در محصولات ویژه
              </Label>
            </div>
          </div>

          {/* توضیحات */}
          <div>
            <Label>توضیح کوتاه</Label>
            <Textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
              placeholder="توضیح کوتاه برای نمایش در لیست..."
            />
          </div>

          <div>
            <Label>توضیحات کامل</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}