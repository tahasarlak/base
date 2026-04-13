'use client';
import { useState } from 'react';
import DynamicDataTable from '@/components/ui/DynamicDataTable';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { useBlogPosts } from '../hooks';
import { blogColumns } from '../table-config';
import NewPostModal from './NewPostModal';
import EditPostModal from './EditPostModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { BlogPostWithRelations } from '../types';
import { deleteBlogPost } from '../actions';

export default function BlogContent() {
  const { data, total, loading, changePage, refresh, error, page, pageSize } = useBlogPosts({
    page: 1,
    pageSize: 15,
  });

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPostWithRelations | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPostWithRelations | null>(null);

  const handleEdit = (post: BlogPostWithRelations) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (post: BlogPostWithRelations) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deleteBlogPost(postToDelete.id);
      refresh();
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف مقاله');
    }
  };

  const handleSuccess = () => {
    refresh();
  };

  // ستون actions
  const columnsWithActions = blogColumns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteClick(row.original)}
            >
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
        <h1 className="text-3xl font-bold tracking-tight">وبلاگ و محتوا</h1>
        <div className="flex gap-3">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            رفرش
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            مقاله جدید
          </Button>
        </div>
      </div>

      {/* جدول و حالات دیگر همان قبلی */}

      {loading && data.length === 0 ? (
        <div className="text-center py-20">در حال بارگذاری...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl p-16">
          <p className="text-muted-foreground mb-4">هنوز مقاله‌ای وجود ندارد</p>
          <Button onClick={() => setIsNewModalOpen(true)}>اولین مقاله را بنویسید</Button>
        </div>
      ) : (
        <DynamicDataTable
          data={data}
          columns={columnsWithActions}
          loading={loading}
          pagination={{
            total,
            page,
            pageSize,
            onPageChange: changePage,
          }}
          searchKey="title"
          placeholder="جستجو در عنوان مقاله..."
        />
      )}

      {/* Modals */}
      <NewPostModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPost(null);
        }}
        onSuccess={handleSuccess}
        post={selectedPost}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={postToDelete?.title || ''}
      />
    </div>
  );
}