// actions/courses.ts
'use server';

import { db } from '@/lib/db';
import { 
  courses, 
  courseModules, 
  courseLessons 
} from '@/lib/db/schema';
import { eq, desc, and, ilike, count, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { 
  CourseFilters, 
  CreateCourseInput, 
  UpdateCourseInput, 
  LessonFormData 
} from './types';

// ====================== دریافت لیست دوره‌ها ======================
export async function getCourses(filters: CourseFilters = {}) {
  const { 
    page = 1, 
    pageSize = 15, 
    search, 
    categoryId, 
    level, 
    minPrice, 
    maxPrice 
  } = filters;

  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  if (search) whereConditions.push(ilike(courses.title, `%${search}%`));
  if (categoryId) whereConditions.push(eq(courses.categoryId, categoryId));
  
  // اصلاح مهم: level را به عنوان string قبول می‌کنیم اما به enum تبدیل می‌کنیم
  if (level) {
    whereConditions.push(eq(courses.level, level as any));
  }
  
  if (minPrice !== undefined) whereConditions.push(gte(courses.price, minPrice));
  if (maxPrice !== undefined) whereConditions.push(lte(courses.price, maxPrice));

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const courseList = await db.query.courses.findMany({
    where: whereClause,
    orderBy: [desc(courses.createdAt)],
    limit: pageSize,
    offset,
    with: {
      category: true,
      mainInstructor: { 
        columns: { id: true, name: true, image: true } 
      },
    },
  });

  const totalResult = await db.select({ count: count() }).from(courses).where(whereClause);
  const total = Number(totalResult[0]?.count || 0);

  return { 
    data: courseList, 
    total, 
    page, 
    pageSize 
  };
}

// ====================== دریافت یک دوره با جزئیات کامل ======================
export async function getCourseById(courseId: string) {
  return await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      category: true,
      mainInstructor: { 
        columns: { id: true, name: true, image: true } 
      },
      // instructors را فعلاً کامنت کردیم چون در with ساده پشتیبانی نمی‌شود
      // instructors: true,
      modules: {
        orderBy: [desc(courseModules.order)],
        with: {
          lessons: {
            orderBy: [desc(courseLessons.order)],
          }
        }
      }
    }
  });
}

// ====================== ایجاد دوره جدید ======================
export async function createCourse(data: CreateCourseInput) {
  const slug = data.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `course-${Date.now()}`;

  const [newCourse] = await db.insert(courses).values({
    title: data.title,
    slug,
    subtitle: data.subtitle || null,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    categoryId: data.categoryId || null,
    semesterId: data.semesterId || null,
    mainInstructorId: data.mainInstructorId,
    price: data.price,
    discountPrice: data.discountPrice || null,
    compareAtPrice: data.compareAtPrice || null,
    duration: data.duration || null,
    level: data.level || 'beginner',
    language: data.language || 'fa',
    thumbnail: data.thumbnail || null,
    featuredImage: data.featuredImage || null,
    isPublished: data.isPublished || false,
    isFree: data.isFree || false,
    maxStudents: data.maxStudents || null,
    prerequisites: data.prerequisites || null,
    whatYouWillLearn: data.whatYouWillLearn || null,
    requirements: data.requirements || null,
  }).returning();

  revalidatePath('/dashboard/courses');
  return newCourse;
}

// ====================== ویرایش دوره ======================
export async function updateCourse(data: UpdateCourseInput) {
  const { id, ...updateData } = data;

  const [updatedCourse] = await db.update(courses)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, id))
    .returning();

  revalidatePath('/dashboard/courses');
  return updatedCourse;
}

// ====================== حذف دوره ======================
export async function deleteCourse(id: string) {
  await db.delete(courses).where(eq(courses.id, id));
  revalidatePath('/dashboard/courses');
}

// ====================== ماژول‌ها ======================
export async function getModulesByCourse(courseId: string) {
  return await db.query.courseModules.findMany({
    where: eq(courseModules.courseId, courseId),
    orderBy: [desc(courseModules.order)],
    with: {
      lessons: true
    }
  });
}

// ====================== درس‌ها ======================
export async function createLesson(data: LessonFormData, moduleId: string) {
  const [newLesson] = await db.insert(courseLessons).values({
    moduleId,
    title: data.title,
    description: data.description || null,
    type: data.type,
    content: data.content || null,
    videoUrl: data.videoUrl || null,
    duration: data.duration || null,
    isPublished: data.isPublished || false,
    isFreePreview: data.isFreePreview || false,
    estimatedTime: data.estimatedTime || null,
    difficulty: data.difficulty || 'medium',
    tags: data.tags || null,
  }).returning();

  return newLesson;
}

export async function updateLesson(lessonId: string, data: LessonFormData) {
  const [updatedLesson] = await db.update(courseLessons)
    .set({
      title: data.title,
      description: data.description || null,
      type: data.type,
      content: data.content || null,
      videoUrl: data.videoUrl || null,
      duration: data.duration || null,
      isPublished: data.isPublished,
      isFreePreview: data.isFreePreview,
      estimatedTime: data.estimatedTime || null,
      difficulty: data.difficulty || 'medium',
      tags: data.tags || null,
      updatedAt: new Date(),
    })
    .where(eq(courseLessons.id, lessonId))
    .returning();

  return updatedLesson;
}

export async function deleteLesson(lessonId: string) {
  await db.delete(courseLessons).where(eq(courseLessons.id, lessonId));
}