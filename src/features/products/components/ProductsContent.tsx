'use client';

import { useState } from 'react';
import DynamicDataTable from '@/components/ui/DynamicDataTable';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';

import NewProductModal from './NewProductModal';
import EditProductModal from './EditProductModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { deleteProduct } from '../actions';
import { useProducts } from '../hooks';
import { productColumns } from '../table-config';
import { Product } from '../types';


export default function ProductContent() {
  const { 
    data, 
    total, 
    loading, 
    changePage, 
    refresh, 
    error, 
    page, 
    pageSize 
  } = useProducts({
    page: 1,
    pageSize: 15,
  });

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      refresh();
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      alert(err.message || 'خطا در حذف محصول');
    }
  };

  const handleSuccess = () => {
    refresh();
  };

  // اضافه کردن ستون عملیات به جدول
  const columnsWithActions = productColumns.map((col) => {
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
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight"></h1>
        <div className="flex gap-3">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            رفرش
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            محصول جدید
          </Button>
        </div>
      </div>

      {/* نمایش خطا */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* جدول محصولات */}
      {loading && data.length === 0 ? (
        <div className="text-center py-20">در حال بارگذاری محصولات...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl p-16">
          <p className="text-muted-foreground mb-4">هنوز محصولی ثبت نشده است</p>
          <Button onClick={() => setIsNewModalOpen(true)}>
            اولین محصول را اضافه کنید
          </Button>
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
          placeholder="جستجو در نام محصول..."
        />
      )}

      {/* مدال‌ها */}
      <NewProductModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={handleSuccess}
        product={selectedProduct}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={productToDelete?.title || ''}
        itemType="محصول"
      />
    </div>
  );
}