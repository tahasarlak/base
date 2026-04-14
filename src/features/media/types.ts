// src/lib/db/types/media.ts

import { fileUploads } from '@/lib/db/schema';

// ==================== تایپ پایه فایل ====================
export type FileUpload = typeof fileUploads.$inferSelect;

// ==================== تایپ کامل با روابط ====================
export type FileWithRelations = FileUpload & {
  uploadedBy?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

// ==================== ورودی آپلود ====================
export type UploadFileInput = {
  file: File;                                   // فایل از ورودی
  entityType?: string;                          // product, course_lesson, blog_post, ...
  entityId?: string;
  access?: 'public' | 'private' | 'authenticated' | 'enrolled' | 'instructor_only';
  metadata?: Record<string, any>;
};

// ==================== پاسخ آپلود ====================
export type UploadResponse = {
  success: boolean;
  file?: FileWithRelations;
  url?: string;
  error?: string;
};

// ==================== فیلتر لیست فایل‌ها ====================
export type FileFilters = {
  page?: number;
  pageSize?: number;
  entityType?: string;
  entityId?: string;
  fileType?: string;
  search?: string;
  userId?: string;
};

// ==================== پاسخ لیست فایل‌ها ====================
export type FilesResponse = {
  data: FileWithRelations[];
  total: number;
  page: number;
  pageSize: number;
};