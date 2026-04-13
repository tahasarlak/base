import { blogPosts, blogCategories, blogTags } from '@/lib/db/schema';

export type BlogPost = typeof blogPosts.$inferSelect & {
  author?: {
    id: string;
    name: string | null;        // ← اصلاح شد: null قبول کند
    image?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // این نوع برای حالت خام query (با with)
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }>;
  commentsCount?: number;
};

// نوع تمیز و نهایی برای استفاده در کامپوننت‌ها و هوک
export type BlogPostWithRelations = Omit<BlogPost, 'tags'> & {
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export type BlogCategory = typeof blogCategories.$inferSelect;
export type BlogTag = typeof blogTags.$inferSelect;

export type BlogFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  isFeatured?: boolean;
  authorId?: string;
};