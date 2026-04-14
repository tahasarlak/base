// src/features/media/actions.ts
'use server';

import { db } from '@/lib/db';
import { fileUploads } from '@/lib/db/schema';
import { eq, desc, and, ilike, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth/get-session';
import { UploadFileInput, UploadResponse, FileFilters, FilesResponse } from './types';


// ====================== آپلود فایل ======================
export async function uploadFile(input: UploadFileInput): Promise<UploadResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('احراز هویت لازم است');
  }

  const { file, entityType, entityId, access = 'private', metadata = {} } = input;

  try {
    // TODO: آپلود واقعی به فضای ذخیره‌سازی (S3, R2, Vercel Blob, ...)
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileKey = `uploads/${timestamp}-${sanitizedName}`;
    const fileUrl = `/uploads/${fileKey}`; // ← بعداً با URL واقعی جایگزین کنید

    const fileTypeValue = getFileType(file.type) as 'image' | 'video' | 'document' | 'audio' | 'archive' | 'pdf' | 'other';

    const [uploadedFile] = await db.insert(fileUploads).values({
      userId: session.user.id,
      fileName: fileKey,
      originalName: file.name,
      fileUrl,
      fileKey,
      mimeType: file.type,
      fileSize: file.size,
      fileType: fileTypeValue,                    // با type assertion درست شد
      access,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata: {
        ...metadata,
        uploadedBy: session.user.id,
        originalSize: file.size,
      },
    }).returning();

    revalidatePath('/dashboard/media');
    revalidatePath('/dashboard/products');

    return {
      success: true,
      file: uploadedFile,
      url: fileUrl,
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'خطا در آپلود فایل',
    };
  }
}

// ====================== دریافت لیست فایل‌ها ======================
export async function getFiles(filters: FileFilters = {}): Promise<FilesResponse> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  if (filters.entityType) whereConditions.push(eq(fileUploads.entityType, filters.entityType));
  if (filters.entityId) whereConditions.push(eq(fileUploads.entityId, filters.entityId));
  if (filters.fileType) whereConditions.push(eq(fileUploads.fileType, filters.fileType));
  if (filters.search) {
    whereConditions.push(ilike(fileUploads.originalName, `%${filters.search}%`));
  }
  if (filters.userId) {
    whereConditions.push(eq(fileUploads.userId, filters.userId));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const files = await db.query.fileUploads.findMany({
    where: whereClause,
    orderBy: [desc(fileUploads.createdAt)],
    limit: pageSize,
    offset,
    with: {
      uploadedBy: {
        columns: { id: true, name: true, image: true },
      },
    },
  });

  const totalResult = await db
    .select({ count: count() })
    .from(fileUploads)
    .where(whereClause);

  const total = Number(totalResult[0]?.count || 0);

  return {
    data: files,
    total,
    page,
    pageSize,
  };
}

// ====================== حذف فایل ======================
export async function deleteFile(fileId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error('احراز هویت لازم است');

  const file = await db.query.fileUploads.findFirst({
    where: eq(fileUploads.id, fileId),
  });

  if (!file) throw new Error('فایل یافت نشد');

  const isOwner = file.userId === session.user.id;
  const isAdmin = ['admin', 'super_admin'].includes(session.user.role || '');

  if (!isOwner && !isAdmin) {
    throw new Error('شما مجوز حذف این فایل را ندارید');
  }

  // TODO: حذف فیزیکی از ذخیره‌سازی
  // await deleteFromStorage(file.fileKey);

  await db.delete(fileUploads).where(eq(fileUploads.id, fileId));

  revalidatePath('/dashboard/media');
  return { success: true, message: 'فایل با موفقیت حذف شد' };
}

// ====================== تابع کمکی تشخیص نوع فایل ======================
function getFileType(mimeType: string): 'image' | 'video' | 'document' | 'audio' | 'archive' | 'pdf' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('document') || mimeType.includes('msword') || mimeType.includes('officedocument')) return 'document';
  return 'other';
}