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
import { createBlogPost } from '../actions';
import { useSession } from '@/hooks/use-session';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPostModal({ isOpen, onClose, onSuccess }: NewPostModalProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !session?.user?.id) return;

    setLoading(true);

    try {
      await createBlogPost({
        title,
        excerpt,
        content: { type: 'doc', content: [] }, // محتوای اولیه خالی برای Tiptap
        status: 'draft',
        authorId: session.user.id,
      });

      onSuccess();
      onClose();
      setTitle('');
      setExcerpt('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('خطا در ایجاد مقاله. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>نوشتن مقاله جدید</DialogTitle>
          <DialogDescription>
            عنوان و خلاصه مقاله را وارد کنید. می‌توانید بعداً محتوا را کامل ویرایش کنید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان مقاله</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان مقاله را وارد کنید..."
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt">خلاصه مقاله (اختیاری)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="یک خلاصه کوتاه از مقاله بنویسید..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'در حال ایجاد...' : 'ایجاد مقاله'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}