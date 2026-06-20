import React, { useState, useEffect } from 'react';
import { API_CONFIG, buildApiUrl } from '../../constants/config';

interface Product {
  id: string;
  product_name: string;
  image_url: string;
  description: string;
  manufacturer: string;
  product_type: string;
  price?: number | null;
  is_price_visible?: number;
  specifications?: any; 
  created_at?: string;
}

interface SpecField {
  key: string;
  value: string;
}

export default function AdminProduct() {
  const [activeTab, setActiveTab] = useState<'review' | 'manual'>('review');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // States cho Thêm thủ công (Manual Tab)
  const [formData, setFormData] = useState({
    product_name: '', manufacturer: '', product_type: '', image_url: '', description: ''
  });
  
  // States quản lý Upload ảnh
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [specs, setSpecs] = useState<SpecField[]>([]);

  // ================= STATES CHO MODAL UPDATE =================
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    product_name: '', manufacturer: '', product_type: '', image_url: '', description: ''
  });
  const [editSpecs, setEditSpecs] = useState<SpecField[]>([]);

  // ================= 🌟 NEW: STATE CHO CUSTOM CONFIRM MODAL =================
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'delete' | null;
  }>({ isOpen: false, type: null });

  // ================= 1. HÀM FETCH =================
  const fetchPendingProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=pending`);
      const data = await response.json();
      if (data.status === 'success') {
        setPendingProducts(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // ================= THUẬT TOÁN UPLOAD ẢNH LÊN IMGUR =================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một file hình ảnh hợp lệ (JPG, PNG, WEBP...)');
      return;
    }

    setIsUploadingImage(true);
    const imgData = new FormData();
    imgData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID 139e72807f61c3c', 
        },
        body: imgData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, image_url: data.data.link });
      } else {
        alert('Lỗi tải ảnh lên Cloud: ' + (data.data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Lỗi upload:', error);
      alert('Không thể kết nối đến máy chủ lưu trữ ảnh.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // ================= QUẢN LÝ SPECIFICATIONS =================
  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecField = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addEditSpecField = () => setEditSpecs([...editSpecs, { key: '', value: '' }]);
  const removeEditSpecField = (index: number) => setEditSpecs(editSpecs.filter((_, i) => i !== index));
  const handleEditSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...editSpecs];
    newSpecs[index][field] = value;
    setEditSpecs(newSpecs);
  };

  // ================= LUỒNG SỬA SẢN PHẨM =================
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      product_name: product.product_name || '',
      manufacturer: product.manufacturer || '',
      product_type: product.product_type || '',
      image_url: product.image_url || '',
      description: product.description || ''
    });

    let parsedSpecs: SpecField[] = [];
    if (product.specifications) {
      try {
        const specsObj = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
        parsedSpecs = Object.keys(specsObj).map(key => ({ key, value: specsObj[key] }));
      } catch (e) {
        console.error("Lỗi parse specifications", e);
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
      specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : null
    };

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PRODUCT), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.status === 'success') {
        alert('Cập nhật sản phẩm thành công!');
        closeEditModal();
        fetchPendingProducts(); 
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // ================= 🌟 NEW: HÀM THỰC THI HÀNH ĐỘNG HÀNG LOẠT (DUYỆT/XÓA) CẢI TIẾN =================
  const executeConfirmAction = async () => {
    if (!confirmDialog.type) return;
    
    const isApprove = confirmDialog.type === 'approve';
    // Đảm bảo API_CONFIG.ENDPOINTS.APPROVE_PRODUCT và DELETE_PRODUCT đã được cấu hình trong config.ts
    const endpoint = isApprove ? API_CONFIG.ENDPOINTS.APPROVE_PRODUCT : API_CONFIG.ENDPOINTS.DELETE_PRODUCT;

    try {
      // Gửi request cho từng ID và bắt lỗi chi tiết từng cái
      const results = await Promise.all(selectedIds.map(async (id) => {
        const response = await fetch(buildApiUrl(endpoint), {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id })
        });
        
        // Bắt chính xác lỗi HTTP (404, 500...)
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      }));

      // Kiểm tra xem có sản phẩm nào bị lỗi logic từ Backend không
      const errorResult = results.find(r => r.status === 'error');
      if (errorResult) {
        alert(`Máy chủ từ chối xử lý: ${errorResult.message}`);
      } else {
        // Tùy chọn: Thay thế alert này bằng một Toast Notification sau này nếu muốn UI đẹp hơn nữa
        // alert(isApprove ? 'Đã duyệt sản phẩm thành công!' : 'Đã xóa sản phẩm thành công!');
        setSelectedIds([]);
        fetchPendingProducts();
      }
    } catch (error) {
      console.error("Critical Fetch Error:", error);
      alert(`Lỗi Mạng hoặc API không tồn tại (${endpoint}). Vui lòng bấm F12 xem tab Network!`);
    } finally {
      // Đóng modal sau khi xử lý xong
      setConfirmDialog({ isOpen: false, type: null });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert("Vui lòng cung cấp URL Hình ảnh hoặc chờ ảnh tải lên hoàn tất!");
      return;
    }

    const specificationsObj = specs.reduce((acc, curr) => {
      if (curr.key.trim() !== '') acc[curr.key.trim()] = curr.value.trim();
      return acc;
    }, {} as Record<string, string>);

    const payload = { ...formData, specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : null };

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADD_PRODUCT), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('Đã xuất bản sản phẩm thành công!');
        setFormData({ product_name: '', manufacturer: '', product_type: '', image_url: '', description: '' });
        setSpecs([]);
        setImageInputMode('url'); 
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden relative">
        
        <div className="border-b border-gray-200">
          <div className="flex bg-gray-50">
            <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-center font-bold text-lg uppercase tracking-wide transition-colors ${activeTab === 'review' ? 'bg-white text-blue-700 border-t-4 border-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              Duyệt Sản Phẩm (Bot)
            </button>
            <button onClick={() => setActiveTab('manual')} className={`flex-1 py-4 text-center font-bold text-lg uppercase tracking-wide transition-colors ${activeTab === 'manual' ? 'bg-white text-[#f26522] border-t-4 border-[#f26522]' : 'text-gray-500 hover:bg-gray-100'}`}>
              Đăng Thủ Công
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* TAB 1: REVIEW */}
          {activeTab === 'review' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sản phẩm chờ duyệt ({pendingProducts.length})</h3>
                {selectedIds.length > 0 && (
                  <div className="flex gap-3">
                    {/* TRIGGER CUSTOM MODALS */}
                    <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete' })} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded font-bold transition-colors">
                      Xóa bỏ ({selectedIds.length})
                    </button>
                    <button onClick={() => setConfirmDialog({ isOpen: true, type: 'approve' })} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-bold transition-colors shadow-sm">
                      Duyệt & Đăng bài ({selectedIds.length})
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu từ máy chủ...</div>
              ) : pendingProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Không có sản phẩm nào cần duyệt.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-y border-gray-200">
                        <th className="p-4 w-12"><input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" onChange={(e) => setSelectedIds(e.target.checked ? pendingProducts.map(p => p.id) : [])} checked={selectedIds.length === pendingProducts.length && pendingProducts.length > 0} /></th>
                        <th className="p-4 font-semibold uppercase text-xs">Hình ảnh</th>
                        <th className="p-4 font-semibold uppercase text-xs">Tên sản phẩm</th>
                        <th className="p-4 font-semibold uppercase text-xs">Phân loại</th>
                        <th className="p-4 font-semibold uppercase text-xs">Mô tả</th>
                        <th className="p-4 font-semibold uppercase text-xs">Thời gian cào</th>
                        <th className="p-4 font-semibold uppercase text-xs text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProducts.map(product => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="p-4"><input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                          <td className="p-4"><img src={product.image_url} alt={product.product_name} className="w-16 h-16 object-cover rounded border" /></td>
                          <td className="p-4 font-medium text-gray-900">{product.product_name}</td>
                          <td className="p-4 text-sm text-gray-600">
                            <span className="text-xs text-gray-500">{product.product_type}</span>
                          </td>
                          <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{product.description}</td>
                          <td className="p-4 text-sm text-gray-500 font-semibold text-[#f26522]">
                            {product.created_at ? new Date(product.created_at).toLocaleString('vi-VN', {
                              hour: '2-digit', minute: '2-digit', second: '2-digit',
                              day: '2-digit', month: '2-digit', year: 'numeric'
                            }) : 'Không xác định'}
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors">
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL SUBMIT */}
          {activeTab === 'manual' && (
            <form className="max-w-4xl mx-auto space-y-6" onSubmit={handleManualSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm *</label>
                  <input type="text" required value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nhà sản xuất *</label>
                  <input type="text" required value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522]" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phân loại *</label>
                  <select required value={formData.product_type} onChange={e => setFormData({...formData, product_type: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522] bg-white">
                    <option value="">-- Chọn phân loại --</option>
                    <option value="Thiết bị máy tính">Thiết bị máy tính</option>
                    <option value="Linh kiện">Linh kiện</option>
                    <option value="Phần mềm">Phần mềm</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-gray-700">Hình ảnh sản phẩm *</label>
                    <div className="flex bg-gray-200 rounded p-1">
                      <button 
                        type="button" 
                        onClick={() => setImageInputMode('url')}
                        className={`px-3 py-1 text-xs font-bold rounded ${imageInputMode === 'url' ? 'bg-white text-[#f26522] shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                      >
                        Nhập URL
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setImageInputMode('upload')}
                        className={`px-3 py-1 text-xs font-bold rounded ${imageInputMode === 'upload' ? 'bg-white text-[#f26522] shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                      >
                        Tải file lên
                      </button>
                    </div>
                  </div>

                  {imageInputMode === 'url' ? (
                    <input 
                      type="url" 
                      required 
                      placeholder="https://..." 
                      value={formData.image_url} 
                      onChange={e => setFormData({...formData, image_url: e.target.value})} 
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522]" 
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" 
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <span className="text-2xl mb-2">📁</span>
                        <span className="text-sm text-gray-600 font-semibold">Nhấn để chọn ảnh từ máy</span>
                        <span className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                      </label>
                      {isUploadingImage && <p className="text-sm text-blue-600 mt-2 font-bold animate-pulse">Đang tải ảnh lên máy chủ Cloud...</p>}
                      {formData.image_url && imageInputMode === 'upload' && !isUploadingImage && (
                        <div className="mt-2 flex flex-col items-center">
                          <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded border border-gray-200 mb-1" />
                          <p className="text-xs text-green-600 truncate max-w-full">Tải thành công: {formData.image_url}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả sản phẩm</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522] resize-y"></textarea>
              </div>

              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800">Thông số kỹ thuật (Tùy chọn)</h4>
                  <button type="button" onClick={addSpecField} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold transition-colors">
                    + Thêm thông số
                  </button>
                </div>
                {specs.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Chưa có thông số nào. Nhấn "Thêm thông số" để bắt đầu.</p>
                ) : (
                  <div className="space-y-3">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex gap-3">
                        <input type="text" placeholder="Tên (VD: RAM, CPU...)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className="w-1/3 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f26522]" />
                        <input type="text" placeholder="Giá trị" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f26522]" />
                        <button type="button" onClick={() => removeSpecField(index)} className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-2 rounded">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 text-right">
                <button type="submit" disabled={isUploadingImage} className={`font-bold py-3 px-8 rounded shadow-md transition-colors ${isUploadingImage ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#f26522] hover:bg-[#d9531e] text-white'}`}>Xuất bản Sản phẩm</button>
              </div>
            </form>
          )}
        </div>

        {/* ================= 🌟 NEW: MODAL UI XÁC NHẬN CHUYÊN NGHIỆP ================= */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
              <div className="flex flex-col items-center text-center">
                {/* ICON DYNAMIC DỰA THEO HÀNH ĐỘNG */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmDialog.type === 'approve' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  {confirmDialog.type === 'approve' ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmDialog.type === 'approve' ? 'Xác nhận Duyệt bài' : 'Xác nhận Xóa dữ liệu'}
                </h3>
                <p className="text-gray-500 mb-8 text-sm">
                  Bạn có chắc chắn muốn {confirmDialog.type === 'approve' ? 'duyệt hiển thị' : 'xóa vĩnh viễn'} <strong className="text-gray-900 text-lg">{selectedIds.length}</strong> sản phẩm đã chọn? Thao tác này không thể hoàn tác.
                </p>
                
                <div className="flex w-full gap-3">
                  <button onClick={() => setConfirmDialog({ isOpen: false, type: null })} className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Hủy bỏ
                  </button>
                  <button onClick={executeConfirmAction} className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-colors ${confirmDialog.type === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700 shadow-md'}`}>
                    Đồng ý {confirmDialog.type === 'approve' ? 'Duyệt' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CẬP NHẬT SẢN PHẨM */}
        {isUpdateModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800">Cập nhật Sản Phẩm: {editingProduct.id}</h2>
                <button onClick={closeEditModal} className="text-gray-500 hover:text-red-500 font-bold text-xl">✕</button>
              </div>
              
              <div className="p-6">
                <form className="space-y-6" onSubmit={handleUpdateSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm *</label>
                      <input type="text" required value={editFormData.product_name} onChange={e => setEditFormData({...editFormData, product_name: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nhà sản xuất *</label>
                      <input type="text" required value={editFormData.manufacturer} onChange={e => setEditFormData({...editFormData, manufacturer: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phân loại *</label>
                      <select required value={editFormData.product_type} onChange={e => setEditFormData({...editFormData, product_type: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600 bg-white">
                        <option value="Thiết bị máy tính">Thiết bị máy tính</option>
                        <option value="Linh kiện">Linh kiện</option>
                        <option value="Phần mềm">Phần mềm</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">URL Hình ảnh *</label>
                      <input type="url" required value={editFormData.image_url} onChange={e => setEditFormData({...editFormData, image_url: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả sản phẩm</label>
                    <textarea rows={3} value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600 resize-y"></textarea>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-800">Thông số kỹ thuật</h4>
                      <button type="button" onClick={addEditSpecField} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold">
                        + Thêm thông số
                      </button>
                    </div>
                    {editSpecs.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Không có thông số kỹ thuật.</p>
                    ) : (
                      <div className="space-y-3">
                        {editSpecs.map((spec, index) => (
                          <div key={index} className="flex gap-3">
                            <input type="text" placeholder="Tên (VD: RAM)" value={spec.key} onChange={(e) => handleEditSpecChange(index, 'key', e.target.value)} className="w-1/3 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
                            <input type="text" placeholder="Giá trị" value={spec.value} onChange={(e) => handleEditSpecChange(index, 'value', e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600" />
                            <button type="button" onClick={() => removeEditSpecField(index)} className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-2 rounded">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={closeEditModal} className="px-6 py-2 rounded font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors">Hủy</button>
                    <button type="submit" className="px-6 py-2 rounded font-bold text-white bg-blue-600 hover:bg-blue-700 shadow transition-colors">Lưu Thay Đổi</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}