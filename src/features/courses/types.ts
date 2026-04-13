import { courses, courseModules, courseLessons } from '@/lib/db/schema';

export type Course = typeof courses.$inferSelect;

export type CourseWithRelations = Course & {
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  mainInstructor?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
  modules?: ModuleWithLessons[];
};

export type ModuleWithLessons = typeof courseModules.$inferSelect & {
  lessons: LessonWithInstructors[];
};

export type LessonWithInstructors = typeof courseLessons.$inferSelect & {
  instructors?: Array<{
    instructorId: string;
    revenueSharePercent: number;
    instructor?: {
      id: string;
      name: string | null;
      image?: string | null;
    };
  }>;
};

export type CourseFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type CreateCourseInput = {
  title: string;
  description?: string | null;
  categoryId?: string | null;
  price: number;
  discountPrice?: number | null;
  duration?: number | null;
  level?: string;
  thumbnail?: string | null;
  isPublished?: boolean;
  isFree?: boolean;
  maxStudents?: number | null;
  prerequisites?: any;
};

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  id: string;
};

export type LessonFormData = {
  title: string;
  description?: string;
  type: string;
  videoUrl?: string;
  fileUrl?: string;
  duration?: number;
  isPublished: boolean;
  isFreePreview: boolean;
  estimatedTime?: number;
  difficulty: string;
  tags?: string[];
  instructorShares: Array<{
    instructorId: string;
    revenueSharePercent: number;
  }>;
};