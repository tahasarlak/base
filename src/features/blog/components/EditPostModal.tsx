'use client';
import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TiptapEditor from '@/components/ui/TiptapEditor';
import { updateBlogPost } from '../actions';
import { BlogPostWithRelations } from '../types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: BlogPostWithRelations | null;
}

export default function EditPostModal({
  isOpen,
  onClose,
  onSuccess,
  post,
}: EditPostModalProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled' | 'archived'>('draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt || '');
      setContent(post.content || { type: 'doc', content: [{ type: 'paragraph' }] });
      setStatus(post.status);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !title.trim()) return;

    setLoading(true);
    try {
      await updateBlogPost(post.id, {
        title,
        excerpt: excerpt || null,
        content,
        status,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || 'خطا در ویرایش مقاله');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[92vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>ویرایش مقاله</DialogTitle>
          <DialogDescription>عنوان، خلاصه و محتوای کامل مقاله را ویرایش کنید.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>عنوان مقاله</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>وضعیت انتشار</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                  <SelectItem value="published">منتشر شده</SelectItem>
                  <SelectItem value="scheduled">زمان‌بندی شده</SelectItem>
                  <SelectItem value="archived">بایگانی شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>خلاصه مقاله (اختیاری)</Label>
            <Input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="خلاصه کوتاه برای نمایش در لیست..."
            />
          </div>

        <div className="flex-1 flex flex-col">
  <Label className="mb-2 block">محتوای کامل مقاله</Label>
  <TiptapEditor 
    content={content} 
    onChange={setContent} 
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