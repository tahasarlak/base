"use server";

import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, desc, ilike, and, count } from 'drizzle-orm';
import { BlogFilters, BlogPostWithRelations } from './types';

export async function getBlogPosts(filters: BlogFilters = {}) {
  const { page = 1, pageSize = 15, search, categoryId, status, isFeatured, authorId } = filters;

  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  if (search) whereConditions.push(ilike(blogPosts.title, `%${search}%`));
  if (categoryId) whereConditions.push(eq(blogPosts.categoryId, categoryId));
  if (status) whereConditions.push(eq(blogPosts.status, status));
  if (isFeatured !== undefined) whereConditions.push(eq(blogPosts.isFeatured, isFeatured));
  if (authorId) whereConditions.push(eq(blogPosts.authorId, authorId));

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const posts = await db.query.blogPosts.findMany({
    with: {
      author: { columns: { id: true, name: true, image: true } },
      category: { columns: { id: true, name: true, slug: true } },
      tags: {
        with: { tag: { columns: { id: true, name: true, slug: true } } },
      },
    },
    where: whereClause,
    orderBy: [desc(blogPosts.createdAt)],
    limit: pageSize,
    offset,
  });

  const totalResult = await db
    .select({ count: count() })
    .from(blogPosts)
    .where(whereClause);

  const total = Number(totalResult[0]?.count || 0);

  const formattedPosts: BlogPostWithRelations[] = posts.map((post) => ({
    ...post,
    author: post.author ?? undefined,
    tags: post.tags
      .map((t) => t.tag)
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null),
  }));

  return {
    data: formattedPosts,
    total,
    page,
    pageSize,
  };
}

export async function createBlogPost(data: {
  title: string;
  excerpt?: string | null;
  content: any;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  authorId: string;
  categoryId?: string | null;
}) {
  try {
    const slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;

    const [newPost] = await db.insert(blogPosts).values({
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content || { type: 'doc', content: [] },
      status: data.status,
      authorId: data.authorId,
      categoryId: data.categoryId || null,
      publishedAt: data.status === 'published' ? new Date() : null,
      isFeatured: false,
    }).returning();

    console.log(`✅ مقاله ایجاد شد | ID: ${newPost.id} | Title: ${newPost.title}`);
    return newPost;
  } catch (error: any) {
    console.error('❌ Error creating post:', error);
    throw new Error(error.message || 'خطا در ایجاد مقاله');
  }
}
// ==================== ویرایش پست ====================
export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    excerpt?: string | null;
    content?: any;
    status?: 'draft' | 'published' | 'scheduled' | 'archived';
    categoryId?: string | null;
    isFeatured?: boolean;
  }
) {
  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === 'published' && !data.content) {
      updateData.publishedAt = new Date();
    }

    const [updatedPost] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    console.log(`✅ مقاله ویرایش شد | ID: ${updatedPost.id}`);
    return updatedPost;
  } catch (error: any) {
    console.error('❌ Error updating post:', error);
    throw new Error('خطا در ویرایش مقاله');
  }
}

// ==================== حذف پست ====================
export async function deleteBlogPost(id: string) {
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    console.log(`🗑️ مقاله حذف شد | ID: ${id}`);
  } catch (error: any) {
    console.error('❌ Error deleting post:', error);
    throw new Error('خطا در حذف مقاله');
  }
}