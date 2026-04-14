// types/courses.ts

export type Course = typeof import('@/lib/db/schema').courses.$inferSelect;

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
  instructors?: Array<{
    instructorId: string;
    role: string;
    revenueSharePercent: string | null;
    instructor?: {
      id: string;
      name: string | null;
      image?: string | null;
    };
  }>;
  modules?: ModuleWithLessons[];
};

export type ModuleWithLessons = typeof import('@/lib/db/schema').courseModules.$inferSelect & {
  lessons: LessonWithInstructors[];
};

export type LessonWithInstructors = typeof import('@/lib/db/schema').courseLessons.$inferSelect & {
  instructors?: Array<{
    instructorId: string;
    revenueSharePercent: string | null;
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
  subtitle?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  categoryId?: string | null;
  semesterId?: string | null;
  mainInstructorId: string;
  price: number;
  discountPrice?: number | null;
  compareAtPrice?: number | null;
  duration?: number | null;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  language?: string;
  thumbnail?: string | null;
  featuredImage?: string | null;
  isPublished?: boolean;
  isFree?: boolean;
  maxStudents?: number | null;
  prerequisites?: string[];
  whatYouWillLearn?: string[];
  requirements?: string[];
};

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  id: string;
};

export type LessonFormData = {
  title: string;
  description?: string | null;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'file' | 'live' | 'reading' | 'scorm';
  content?: any;
  videoUrl?: string | null;
  duration?: number | null;
  isPublished?: boolean;
  isFreePreview?: boolean;
  estimatedTime?: number | null;
  difficulty?: string;
  tags?: string[] | null;
};