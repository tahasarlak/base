'use client';

import { useState } from 'react';
import DynamicDataTable from '@/components/ui/DynamicDataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useCourses } from '../hooks';
import { courseColumns } from '../table-config';
import type { CourseWithRelations } from '../types';
import { deleteCourse } from '../actions';
import EditCourseModal from './EditCourseModal';
import NewCourseModal from './NewCourseModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function CoursesContent() {
  const { data, total, loading, changePage, refresh, error, page, pageSize } = useCourses();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<CourseWithRelations | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseWithRelations | null>(null);

  const handleEdit = (course: CourseWithRelations) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (course: CourseWithRelations) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse(courseToDelete.id);
      refresh();
    } catch (err: any) {
      alert(err.message || 'خطا در حذف دوره');
    } finally {
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleSuccess = () => refresh();

  const columnsWithActions = courseColumns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      };
    }
    return col;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">دوره‌های آموزشی</h1>
        <div className="flex gap-3">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            رفرش
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            دوره جدید
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>}

      <DynamicDataTable
        data={data}
        columns={columnsWithActions}
        loading={loading}
        pagination={{ total, page, pageSize, onPageChange: changePage }}
        searchKey="title"
        placeholder="جستجو در عنوان دوره..."
      />

      <NewCourseModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={handleSuccess} />
      <EditCourseModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedCourse(null); }} onSuccess={handleSuccess} course={selectedCourse} />
      <DeleteConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} title={courseToDelete?.title || ''}  />
    </div>
  );
}