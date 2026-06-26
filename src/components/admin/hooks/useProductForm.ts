import React, { useState } from 'react';
import { API_CONFIG, buildApiUrl } from '../../../constants/config';
import { EMPTY_FORM_DATA, type ProductFormData, type SpecField } from '../types';

interface UseProductFormArgs {
  fetchProducts: () => Promise<void>;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
}

const IMGUR_CLIENT_ID = '139e72807f61c3c';

export function useProductForm({ fetchProducts, showSuccess, showError }: UseProductFormArgs) {
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM_DATA);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [specs, setSpecs] = useState<SpecField[]>([]);

  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecField = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Ảnh không hợp lệ', 'Vui lòng chọn tệp tin hình ảnh chuẩn!');
      return;
    }

    setIsUploadingImage(true);
    const imgData = new FormData();
    imgData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
        body: imgData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.link }));
      } else {
        showError('Lỗi tải ảnh', `Lỗi tải ảnh: ${data.data?.error || 'Unknown error'}`);
      }
    } catch {
      showError('Lỗi kết nối ảnh', 'Mất liên kết với máy chủ ảnh Cloud.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      showError('Thiếu ảnh', 'Vui lòng bổ sung liên kết hình ảnh!');
      return;
    }

    const specificationsObj = specs.reduce((acc, curr) => {
      if (curr.key.trim() !== '') acc[curr.key.trim()] = curr.value.trim();
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      ...formData,
      specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : null,
    };

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADD_PRODUCT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setFormData(EMPTY_FORM_DATA);
        setSpecs([]);
        setImageInputMode('url');
        fetchProducts();
        showSuccess('Đã lưu sản phẩm', 'Sản phẩm thủ công đã được thêm vào danh sách.');
      } else {
        showError('Lỗi hệ thống', result.message || 'Không thể lưu sản phẩm.');
      }
    } catch {
      showError('Lỗi API', 'Lỗi cổng kết nối API.');
    }
  };

  return {
    formData,
    setFormData,
    imageInputMode,
    setImageInputMode,
    isUploadingImage,
    specs,
    addSpecField,
    removeSpecField,
    handleSpecChange,
    handleImageUpload,
    handleManualSubmit,
  };
}
