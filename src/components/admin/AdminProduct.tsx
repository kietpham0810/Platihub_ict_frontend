import { useState, useEffect } from 'react';
import AdminProductTable from './AdminProductTable';
import AdminProductManual from './AdminProductManual';
import ConfirmDialog from './modals/ConfirmDialog';
import ResultDialog from './modals/ResultDialog';
import BotContinueDialog from './modals/BotContinueDialog';
import EditProductModal from './modals/EditProductModal';
import { useDialogs } from './hooks/useDialogs';
import { useProductData } from './hooks/useProductData';
import { useProductBot } from './hooks/useProductBot';
import { useProductForm } from './hooks/useProductForm';

export type { Product, SpecField } from './types';

export default function AdminProduct() {
  const [activeTab, setActiveTab] = useState<'review' | 'manual' | 'manage'>('review');

  const dialogs = useDialogs();
  const { showSuccess, showError, closeResult } = dialogs;

  const products = useProductData({ showSuccess, showError });
  const bot = useProductBot({ fetchProducts: products.fetchProducts, dialogs });
  const form = useProductForm({ fetchProducts: products.fetchProducts, showSuccess, showError });

  const { setSelectedIds } = products;
  useEffect(() => {
    // This effect remains to clear selection when switching main tabs
    setSelectedIds([]);
  }, [activeTab, setSelectedIds]);

  const handleBotStop = () => {
    dialogs.setBotContinueDialog({ isOpen: false, nextOffset: 0, url: '', summary: '' });
    bot.stopBot();
  };

  const handleBotContinue = () => {
    const { nextOffset, url } = dialogs.botContinueDialog;
    dialogs.setBotContinueDialog({ isOpen: false, nextOffset: 0, url: '', summary: '' });
    bot.executeBotCrawl(url, nextOffset);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-md overflow-hidden relative">

        <AdminProductTable
          activeTab={activeTab}
          // Data
          pendingProducts={products.pendingProducts}
          approvedProducts={products.approvedProducts}
          isLoading={products.isLoading}
          // Bot
          botReport={bot.botReport}
          accumulatedReport={bot.accumulatedReport}
          isBotRunning={bot.isBotRunning}
          crawlUrl={bot.crawlUrl}
          handleRunBot={bot.handleRunBot}
          setCrawlUrl={bot.setCrawlUrl}
          // Category Filtering
          pendingCategories={products.pendingCategories}
          categoryFilter={products.categoryFilter}
          setCategoryFilter={products.setCategoryFilter}
          // Spec Filtering
          specFilters={products.specFilters}
          setSpecFilters={products.setSpecFilters}
          availableSpecFilters={products.availableSpecFilters}
          filterableSpecsForCategory={products.filterableSpecsForCategory}
          // Actions
          setActiveTab={setActiveTab}
          selectedIds={products.selectedIds}
          setSelectedIds={products.setSelectedIds}
          setConfirmDialog={products.setConfirmDialog}
          openEditModal={products.openEditModal}
          toggleSelect={products.toggleSelect}
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

        <BotContinueDialog
          dialog={dialogs.botContinueDialog}
          onStop={handleBotStop}
          onContinue={handleBotContinue}
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
