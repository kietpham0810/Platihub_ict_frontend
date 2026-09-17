import React, { useState, useEffect, useMemo } from 'react';
import { API_CONFIG, PRODUCT_CATEGORY_OPTIONS, buildApiUrl } from '../../../constants/config';
import {
  EMPTY_FORM_DATA,
  type Product,
  type ProductFormData,
  type SpecField,
  type ConfirmDialogState,
  type ConfirmType,
} from '../types';

interface DialogHelpers {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
}

export function useProductData({ showSuccess, showError }: DialogHelpers) {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: null,
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<ProductFormData>(EMPTY_FORM_DATA);
  const [editSpecs, setEditSpecs] = useState<SpecField[]>([]);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  const [bulkProgress, setBulkProgress] = useState<{
    active: boolean;
    type: ConfirmType | null;
    current: number;
    total: number;
    lastNames: string[];
  }>({ active: false, type: null, current: 0, total: 0, lastNames: [] });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=pending`),
        fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=approved`),
      ]);

      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      if (pendingData.status === 'success') setPendingProducts(pendingData.data);
      if (approvedData.status === 'success') setApprovedProducts(approvedData.data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const pendingCategories = useMemo(() => {
    const categoryValues = PRODUCT_CATEGORY_OPTIONS.map(c => c.value).sort();
    return ['All', ...categoryValues];
  }, []);

  const manufacturerOptions = useMemo(() => {
    const all = [...pendingProducts, ...approvedProducts]
      .map(p => p.manufacturer)
      .filter((m): m is string => !!m && m.trim() !== '');
    return ['All', ...Array.from(new Set(all)).sort((a, b) => a.localeCompare(b))];
  }, [pendingProducts, approvedProducts]);

  const applyFilters = (list: Product[]) => {
    const query = searchQuery.trim().toLowerCase();
    const min = priceMin.trim() !== '' ? Number(priceMin) : null;
    const max = priceMax.trim() !== '' ? Number(priceMax) : null;

    return list.filter(p => {
      if (categoryFilter !== 'All' && p.product_type !== categoryFilter) return false;
      if (manufacturerFilter !== 'All' && p.manufacturer !== manufacturerFilter) return false;

      if (query) {
        const specsText = p.specifications ? String(p.specifications).toLowerCase() : '';
        const haystack = `${p.product_name || ''} ${p.manufacturer || ''} ${specsText}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (min !== null && (!p.price || p.price < min)) return false;
      if (max !== null && (!p.price || p.price > max)) return false;

      return true;
    });
  };

  const filteredPendingProducts = useMemo(
    () => applyFilters(pendingProducts),
    [pendingProducts, categoryFilter, manufacturerFilter, searchQuery, priceMin, priceMax]
  );

  const filteredApprovedProducts = useMemo(
    () => applyFilters(approvedProducts),
    [approvedProducts, categoryFilter, manufacturerFilter, searchQuery, priceMin, priceMax]
  );

  const activeFilterCount = [
    categoryFilter !== 'All',
    manufacturerFilter !== 'All',
    searchQuery.trim() !== '',
    priceMin.trim() !== '',
    priceMax.trim() !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCategoryFilter('All');
    setManufacturerFilter('All');
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [categoryFilter, manufacturerFilter, searchQuery, priceMin, priceMax]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addEditSpecField = () => setEditSpecs([...editSpecs, { key: '', value: '' }]);
  const removeEditSpecField = (index: number) =>
    setEditSpecs(editSpecs.filter((_, i) => i !== index));
  const handleEditSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...editSpecs];
    newSpecs[index][field] = value;
    setEditSpecs(newSpecs);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      product_name: product.product_name || '',
      manufacturer: product.manufacturer || '',
      product_type: product.product_type || '',
      image_url: product.image_url || '',
      description: product.description || '',
    });

    let parsedSpecs: SpecField[] = [];
    if (product.specifications) {
      try {
        const specsObj =
          typeof product.specifications === 'string'
            ? JSON.parse(product.specifications)
            : product.specifications;
        parsedSpecs = Object.keys(specsObj).map(key => ({ key, value: specsObj[key] }));
      } catch {
        /* ignore malformed specifications */
      }
    }
    setEditSpecs(parsedSpecs);
    setIsUpdateModalOpen(true);
  };

  const closeEditModal = () => {
    setIsUpdateModalOpen(false);
    setEditingProduct(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const specificationsObj = editSpecs.reduce((acc, curr) => {
      if (curr.key.trim() !== '') acc[curr.key.trim()] = curr.value.trim();
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      id: editingProduct.id,
      ...editFormData,
      specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : null,
    };

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PRODUCT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.status === 'success') {
        closeEditModal();
        fetchProducts();
        showSuccess('Cập nhật thành công', 'Thông tin sản phẩm đã được chỉnh sửa thành công.');
      } else {
        showError('Cập nhật thất bại', result.message || 'Không thể cập nhật sản phẩm.');
      }
    } catch {
      showError('Lỗi kết nối', 'Lỗi thiết lập kênh truyền dữ liệu. Vui lòng thử lại.');
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmDialog.type) return;
    const type: ConfirmType = confirmDialog.type;

    let endpoint = '';
    if (type === 'approve') endpoint = API_CONFIG.ENDPOINTS.APPROVE_PRODUCT;
    else if (type === 'delete') endpoint = API_CONFIG.ENDPOINTS.DELETE_PRODUCT;
    else if (type === 'hide') endpoint = API_CONFIG.ENDPOINTS.HIDE_PRODUCT;

    const allProducts = [...pendingProducts, ...approvedProducts];
    const nameById = new Map(allProducts.map(p => [p.id, p.product_name]));
    const total = selectedIds.length;

    setConfirmDialog({ isOpen: false, type: null });
    setBulkProgress({ active: true, type, current: 0, total, lastNames: [] });

    try {
      let hasError = false;
      let errorMessage = '';
      let doneCount = 0;

      for (const id of selectedIds) {
        const response = await fetch(buildApiUrl(endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) { hasError = true; errorMessage = `HTTP ${response.status}`; break; }
        const result = await response.json();
        if (result.status === 'error') { hasError = true; errorMessage = result.message; break; }

        doneCount += 1;
        const name = nameById.get(id) || id;
        setBulkProgress(prev => ({
          ...prev,
          current: doneCount,
          lastNames: [name, ...prev.lastNames].slice(0, 3),
        }));
      }

      if (hasError) {
        showError('Thao tác không thành công', errorMessage || 'Đã có lỗi xảy ra khi xử lý sản phẩm.');
      } else {
        showSuccess('Hoàn tất', `${type === 'approve' ? `Đã duyệt thành công` : type === 'hide' ? `Đã ẩn thành công` : `Đã xóa thành công`} ${total} sản phẩm.`);
        setSelectedIds([]);
        fetchProducts();
      }
    } catch {
      showError('Lỗi kết nối', 'Đường truyền API bị lỗi. Vui lòng thử lại sau.');
    } finally {
      setBulkProgress(prev => ({ ...prev, active: false }));
    }
  };

  return {
    pendingProducts: filteredPendingProducts,
    pendingCategories,
    categoryFilter,
    setCategoryFilter,
    manufacturerFilter,
    setManufacturerFilter,
    manufacturerOptions,
    searchQuery,
    setSearchQuery,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    activeFilterCount,
    clearFilters,
    approvedProducts: filteredApprovedProducts,
    isLoading,
    fetchProducts,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    confirmDialog,
    setConfirmDialog,
    executeConfirmAction,
    bulkProgress,
    isUpdateModalOpen,
    editingProduct,
    editFormData,
    setEditFormData,
    editSpecs,
    addEditSpecField,
    removeEditSpecField,
    handleEditSpecChange,
    openEditModal,
    closeEditModal,
    handleUpdateSubmit,
  };
}
