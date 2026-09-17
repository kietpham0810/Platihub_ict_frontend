import { useState, useEffect } from 'react';
import AdminProductTable from './AdminProductTable';
import AdminProductManual from './AdminProductManual';
import ConfirmDialog from './modals/ConfirmDialog';
import BulkProgressToast from './modals/BulkProgressToast';
import ResultDialog from './modals/ResultDialog';
import EditProductModal from './modals/EditProductModal';
import { useNavigate } from 'react-router-dom';
import { useDialogs } from './hooks/useDialogs';
import { useProductData } from './hooks/useProductData';
import { useProductForm } from './hooks/useProductForm';
import { clearAdminToken } from '../../constants/config';

export type { Product, SpecField } from './types';

export default function AdminProduct() {
  const [activeTab, setActiveTab] = useState<'review' | 'manual' | 'manage'>('review');
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const { showSuccess, showError, closeResult } = dialogs;

  const products = useProductData({ showSuccess, showError });
  const form = useProductForm({
    fetchProducts: products.fetchProducts,
    showSuccess,
    showError,
    onSessionExpired: products.handleSessionExpired,
  });

  const handleLogout = () => {
    clearAdminToken();
    navigate('/');
  };

  const { setSelectedIds } = products;
  useEffect(() => {
    // This effect remains to clear selection when switching main tabs
    setSelectedIds([]);
  }, [activeTab, setSelectedIds]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-md overflow-hidden relative">

        <div className="flex justify-end px-4 pt-4 md:px-8 md:pt-6">
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Đăng xuất
          </button>
        </div>

        <AdminProductTable
          activeTab={activeTab}
          pendingProducts={products.pendingProducts}
          approvedProducts={products.approvedProducts}
          selectedIds={products.selectedIds}
          isLoading={products.isLoading}
          fetchProducts={products.fetchProducts}
          pendingCategories={products.pendingCategories}
          categoryFilter={products.categoryFilter}
          setCategoryFilter={products.setCategoryFilter}
          manufacturerFilter={products.manufacturerFilter}
          setManufacturerFilter={products.setManufacturerFilter}
          manufacturerOptions={products.manufacturerOptions}
          searchQuery={products.searchQuery}
          setSearchQuery={products.setSearchQuery}
          priceMin={products.priceMin}
          setPriceMin={products.setPriceMin}
          priceMax={products.priceMax}
          setPriceMax={products.setPriceMax}
          activeFilterCount={products.activeFilterCount}
          clearFilters={products.clearFilters}
          setActiveTab={setActiveTab}
          setSelectedIds={products.setSelectedIds}
          setConfirmDialog={products.setConfirmDialog}
          openEditModal={products.openEditModal}
          toggleSelect={products.toggleSelect}
          onSessionExpired={products.handleSessionExpired}
          failedActionIds={products.failedActionIds}
        />

        <div className="p-8">
          {activeTab === 'manual' && (
            <AdminProductManual
              formData={form.formData}
              imageInputMode={form.imageInputMode}
              isUploadingImage={form.isUploadingImage}
              specs={form.specs}
              setFormData={form.setFormData}
              setImageInputMode={form.setImageInputMode}
              handleImageUpload={form.handleImageUpload}
              addSpecField={form.addSpecField}
              removeSpecField={form.removeSpecField}
              handleSpecChange={form.handleSpecChange}
              handleManualSubmit={form.handleManualSubmit}
            />
          )}
        </div>

        <ConfirmDialog
          dialog={products.confirmDialog}
          selectedCount={products.selectedIds.length}
          onCancel={() => products.setConfirmDialog({ isOpen: false, type: null })}
          onConfirm={products.executeConfirmAction}
        />

        <BulkProgressToast
          active={products.bulkProgress.active}
          type={products.bulkProgress.type}
          current={products.bulkProgress.current}
          total={products.bulkProgress.total}
          errorCount={products.bulkProgress.errorCount}
          lastNames={products.bulkProgress.lastNames}
        />

        <ResultDialog dialog={dialogs.resultDialog} onClose={closeResult} />

        <EditProductModal
          isOpen={products.isUpdateModalOpen}
          editingProduct={products.editingProduct}
          editFormData={products.editFormData}
          setEditFormData={products.setEditFormData}
          editSpecs={products.editSpecs}
          addEditSpecField={products.addEditSpecField}
          removeEditSpecField={products.removeEditSpecField}
          handleEditSpecChange={products.handleEditSpecChange}
          onClose={products.closeEditModal}
          onSubmit={products.handleUpdateSubmit}
        />

      </div>
    </div>
  );
}
