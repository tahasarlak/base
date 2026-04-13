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
import { createProduct } from '../actions';
import { useSession } from '@/hooks/use-session'; // اگر هوک سشن داری

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewProductModal({
  isOpen,
  onClose,
  onSuccess,
}: NewProductModalProps) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [type, setType] = useState<'digital' | 'physical' | 'course' | 'subscription' | 'service'>('digital');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !session?.user?.id) return;

    setLoading(true);

    try {
      await createProduct({
        title,
        shortDescription: shortDescription || null,
        description: description || null,
        price: parseInt(price),
        discountPrice: discountPrice ? parseInt(discountPrice) : null,
        type,
        status: 'draft',
        stock: parseInt(stock),
        isFeatured,
      });

      onSuccess();
      onClose();

      // ریست کردن فرم
      setTitle('');
      setShortDescription('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setStock('0');
      setIsFeatured(false);
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(error.message || 'خطا در ایجاد محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>محصول جدید</DialogTitle>
          <DialogDescription>
            اطلاعات پایه محصول را وارد کنید. می‌توانید بعداً جزئیات بیشتری اضافه کنید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">عنوان محصول *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: دوره آموزش React"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">نوع محصول *</Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">دیجیتال (فایل)</SelectItem>
                  <SelectItem value="physical">فیزیکی</SelectItem>
                  <SelectItem value="course">دوره آموزشی</SelectItem>
                  <SelectItem value="subscription">اشتراکی</SelectItem>
                  <SelectItem value="service">خدمات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">قیمت (تومان) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="۰"
                required
              />
            </div>

            <div>
              <Label htmlFor="discountPrice">قیمت با تخفیف (تومان)</Label>
              <Input
                id="discountPrice"
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="اختیاری"
              />
            </div>

            <div>
              <Label htmlFor="stock">موجودی</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
              />
            </div>

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

          <div>
            <Label htmlFor="shortDescription">توضیح کوتاه</Label>
            <Textarea
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="یک توضیح کوتاه برای نمایش در لیست محصولات..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">توضیحات کامل</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات کامل محصول را اینجا بنویسید..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !price}>
              {loading ? 'در حال ایجاد...' : 'ایجاد محصول'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}