import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG, PRODUCT_CATEGORY_OPTIONS, adminAuthHeaders, buildApiUrl, clearAdminToken } from '../../../constants/config';
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
  const navigate = useNavigate();

  // Phiên đăng nhập admin hết hạn (token quá 12h) hoặc không hợp lệ -> đăng
  // xuất và đưa về trang chủ, thay vì để mọi request tiếp theo âm thầm trả 401.
  const handleSessionExpired = () => {
    clearAdminToken();
    showError('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.');
    navigate('/');
  };

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
    errorCount: number;
    lastNames: string[];
  }>({ active: false, type: null, current: 0, total: 0, errorCount: 0, lastNames: [] });

  // ID sản phẩm bị lỗi ở lần bulk action gần nhất - dùng để đánh dấu trực
  // quan trên bảng (không chỉ dựa vào checkbox còn tích, vì admin dễ hiểu
  // nhầm là "chọn nhầm" và bỏ chọn, mất luôn thông tin cần thử lại).
  const [failedActionIds, setFailedActionIds] = useState<Set<string>>(new Set());

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=pending`, { headers: adminAuthHeaders() }),
        fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=approved`),
      ]);

      if (pendingRes.status === 401) {
        handleSessionExpired();
        return;
      }

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
        headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

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
    if (!confirmDialog.type || selectedIds.length === 0) {
      setConfirmDialog({ isOpen: false, type: null });
      return;
    }
    const type: ConfirmType = confirmDialog.type;

    let endpoint = '';
    if (type === 'approve') endpoint = API_CONFIG.ENDPOINTS.APPROVE_PRODUCT;
    else if (type === 'delete') endpoint = API_CONFIG.ENDPOINTS.DELETE_PRODUCT;
    else if (type === 'hide') endpoint = API_CONFIG.ENDPOINTS.HIDE_PRODUCT;

    const allProducts = [...pendingProducts, ...approvedProducts];
    const nameById = new Map(allProducts.map(p => [p.id, p.product_name]));
    const total = selectedIds.length;

    setConfirmDialog({ isOpen: false, type: null });
    setFailedActionIds(new Set());
    setBulkProgress({ active: true, type, current: 0, total, errorCount: 0, lastNames: [] });

    // Xử lý HẾT danh sách đã chọn thay vì dừng ngay ở lỗi đầu tiên (trước đây
    // `break` khi gặp lỗi khiến các sản phẩm xử lý trước đó đã thành công
    // trên server nhưng UI không refresh, dễ khiến admin bấm lại và xử lý
    // trùng/nhầm). Giờ luôn refetch cuối cùng và chỉ giữ lại lựa chọn của
    // những sản phẩm THẤT BẠI để admin biết chính xác cần thử lại cái nào.
    try {
      let doneCount = 0;
      let processedCount = 0;
      let errorCount = 0;
      const failedIds: string[] = [];
      let sessionExpiredMidway = false;

      for (const id of selectedIds) {
        if (sessionExpiredMidway) {
          failedIds.push(id);
          continue;
        }

        let succeeded = false;
        try {
          const response = await fetch(buildApiUrl(endpoint), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
            body: JSON.stringify({ id }),
          });

          if (response.status === 401) {
            sessionExpiredMidway = true;
            failedIds.push(id);
          } else {
            const result = await response.json();
            if (!response.ok || result.status === 'error') {
              failedIds.push(id);
            } else {
              succeeded = true;
            }
          }
        } catch {
          failedIds.push(id);
        }

        processedCount += 1;
        if (succeeded) {
          doneCount += 1;
        } else if (!sessionExpiredMidway) {
          errorCount += 1;
        }

        const name = nameById.get(id) || id;
        setBulkProgress(prev => ({
          ...prev,
          current: processedCount,
          errorCount,
          lastNames: succeeded ? [name, ...prev.lastNames].slice(0, 3) : prev.lastNames,
        }));
      }

      setSelectedIds(failedIds);
      setFailedActionIds(new Set(failedIds));
      await fetchProducts();

      // Nếu hết phiên giữa chừng, chỉ báo đúng 1 thông báo (phiên hết hạn)
      // rồi điều hướng luôn - tránh chồng 2 toast (vừa "hoàn tất một phần"
      // vừa "phiên hết hạn") ngay trước khi admin bị đá khỏi trang, khiến
      // thông báo đầu trở nên vô nghĩa vì không kịp đọc/thao tác tiếp.
      if (sessionExpiredMidway) {
        handleSessionExpired();
        return;
      }

      const actionLabel = type === 'approve' ? 'duyệt' : type === 'hide' ? 'ẩn' : 'xóa';
      if (failedIds.length === 0) {
        showSuccess('Hoàn tất', `Đã ${actionLabel} thành công ${total} sản phẩm.`);
      } else if (doneCount > 0) {
        showError(
          'Hoàn tất một phần',
          `Đã ${actionLabel} thành công ${doneCount}/${total} sản phẩm. ${failedIds.length} sản phẩm còn lại vẫn đang được chọn để bạn thử lại.`
        );
      } else {
        showError('Thao tác không thành công', `Không thể ${actionLabel} sản phẩm nào trong số ${total} sản phẩm đã chọn.`);
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
    handleSessionExpired,
    failedActionIds,
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
