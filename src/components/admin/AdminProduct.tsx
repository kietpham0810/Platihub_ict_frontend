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
  const [activeTab, setActiveTab] = useState<'review' | 'manual' | 'manage'>('review');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trạng thái vận hành Bot trên UI
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botReport, setBotReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    product_name: '', manufacturer: '', product_type: '', image_url: '', description: ''
  });
  
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [specs, setSpecs] = useState<SpecField[]>([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    product_name: '', manufacturer: '', product_type: '', image_url: '', description: ''
  });
  const [editSpecs, setEditSpecs] = useState<SpecField[]>([]);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'delete' | 'hide' | null;
  }>({ isOpen: false, type: null });

  // ================= KÉO DỮ LIỆU ĐỒNG THỜI =================
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=pending`),
        fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=approved`)
      ]);
      
      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      if (pendingData.status === 'success') setPendingProducts(pendingData.data);
      if (approvedData.status === 'success') setApprovedProducts(approvedData.data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // ================= ĐIỀU KHIỂN HOẠT ĐỘNG CỦA BOT TỪ UI =================
  const handleRunBot = async () => {
    setIsBotRunning(true);
    setBotReport(null);
    try {
      // Gọi trực tiếp đến file xử lý bot trên máy chủ Backend Render
      const response = await fetch(buildApiUrl('/bot_sync_digiworld.php'));
      const data = await response.json();
      if (data.status === 'success') {
        setBotReport(data.data);
        fetchProducts(); // Cập nhật lại lưới hiển thị dữ liệu mới cào
      } else {
        alert('Cảnh báo từ Động cơ Bot: ' + data.message);
      }
    } catch (error) {
      alert('Không thể kết nối đến luồng xử lý tự động của Bot.');
    } finally {
      setIsBotRunning(false);
    }
  };

  // ================= UPLOAD ẢNH SERVERLESS =================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp tin hình ảnh chuẩn!');
      return;
    }

    setIsUploadingImage(true);
    const imgData = new FormData();
    imgData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { Authorization: 'Client-ID 139e72807f61c3c' },
        body: imgData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, image_url: data.data.link });
      } else {
        alert('Lỗi tải ảnh: ' + (data.data?.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Mất liên kết với máy chủ ảnh Cloud.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // ================= QUẢN LÝ THÔNG SỐ KỸ THUẬT DYNAMIC =================
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

  // ================= ĐOẠN ĐƯỜNG PHẪU THUẬT SỬA SẢN PHẨM =================
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
      } catch (e) {}
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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.status === 'success') {
        closeEditModal();
        fetchProducts(); 
      } else {
        alert(`Lỗi Backend: ${result.message}`);
      }
    } catch (error) {
      alert('Lỗi thiết lập kênh truyền dữ liệu.');
    }
  };

  // ================= ĐIỀU PHỐI TÁC VỤ HÀNG LOẠT =================
  const executeConfirmAction = async () => {
    if (!confirmDialog.type) return;
    
    let endpoint = '';
    if (confirmDialog.type === 'approve') endpoint = API_CONFIG.ENDPOINTS.APPROVE_PRODUCT;
    else if (confirmDialog.type === 'delete') endpoint = API_CONFIG.ENDPOINTS.DELETE_PRODUCT;
    else if (confirmDialog.type === 'hide') endpoint = API_CONFIG.ENDPOINTS.HIDE_PRODUCT;

    try {
      const results = await Promise.all(selectedIds.map(async (id) => {
        const response = await fetch(buildApiUrl(endpoint), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      }));

      const errorResult = results.find(r => r.status === 'error');
      if (errorResult) {
        alert(`Xử lý lỗi: ${errorResult.message}`);
      } else {
        setSelectedIds([]);
        fetchProducts(); 
      }
    } catch (error) {
      alert(`Đường truyền dữ liệu API lỗi. Hãy kiểm tra F12 tab Network!`);
    } finally {
      setConfirmDialog({ isOpen: false, type: null });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      alert("Vui lòng bổ sung liên kết hình ảnh!");
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
        setFormData({ product_name: '', manufacturer: '', product_type: '', image_url: '', description: '' });
        setSpecs([]);
        setImageInputMode('url'); 
        fetchProducts();
      } else {
        alert(`Lỗi hệ thống: ${result.message}`);
      }
    } catch (error) {
      alert('Lỗi cổng kết nối API.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-md overflow-hidden relative">
        
        {/* ================= TABS NAVIGATION & AI CONTROL PANEL ================= */}
        <div className="border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between pr-6">
          <div className="flex flex-1">
            <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 text-center font-bold text-sm md:text-base uppercase tracking-wide transition-colors ${activeTab === 'review' ? 'bg-white text-blue-700 border-t-4 border-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              Chờ Duyệt ({pendingProducts.length})
            </button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 py-4 text-center font-bold text-sm md:text-base uppercase tracking-wide transition-colors ${activeTab === 'manage' ? 'bg-white text-emerald-600 border-t-4 border-emerald-600' : 'text-gray-500 hover:bg-gray-100'}`}>
              Quản lý Sản Phẩm ({approvedProducts.length})
            </button>
            <button onClick={() => setActiveTab('manual')} className={`flex-1 py-4 text-center font-bold text-sm md:text-base uppercase tracking-wide transition-colors ${activeTab === 'manual' ? 'bg-white text-[#f26522] border-t-4 border-[#f26522]' : 'text-gray-500 hover:bg-gray-100'}`}>
              Đăng Thủ Công
            </button>
          </div>
          
          {/* 🤖 BẢNG ĐIỀU KHIỂN BOT CÀO DỮ LIỆU TỰ ĐỘNG CHUYÊN NGHIỆP */}
          <div className="p-3 md:p-0 flex items-center gap-3 justify-end">
            {botReport && (
              <div className="text-right hidden xl:block">
                <p className="text-[11px] text-green-600 font-bold">✨ Bot vừa quét xong trang: {botReport.scanned_pages}</p>
                <p className="text-[10px] text-gray-400">Thêm mới: {botReport.new_inserted} | Trùng: {botReport.skipped_duplicates}</p>
              </div>
            )}
            <button 
              onClick={handleRunBot} 
              disabled={isBotRunning}
              className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm shadow flex items-center gap-2 transition-all ${isBotRunning ? 'bg-gray-200 text-gray-400 cursor-not-allowed animate-pulse' : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800'}`}
            >
              <span>{isBotRunning ? '⚙️' : '🤖'}</span>
              {isBotRunning ? 'Đang Deep Crawl...' : 'Kích hoạt Bot cào dữ liệu'}
            </button>
          </div>
        </div>

        <div className="p-8">
          
          {/* TAB 1: REVIEW */}
          {activeTab === 'review' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Cần kiểm duyệt</h3>
                {selectedIds.length > 0 && (
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete' })} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded font-bold transition-colors">Xóa bỏ ({selectedIds.length})</button>
                    <button onClick={() => setConfirmDialog({ isOpen: true, type: 'approve' })} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-bold transition-colors shadow-sm">Duyệt & Đăng bài ({selectedIds.length})</button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
              ) : pendingProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium">Kho dữ liệu sạch sẽ. Không có sản phẩm nào đang chờ duyệt.</div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <th className="p-4 w-12"><input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" onChange={(e) => setSelectedIds(e.target.checked ? pendingProducts.map(p => p.id) : [])} checked={selectedIds.length === pendingProducts.length && pendingProducts.length > 0} /></th>
                        <th className="p-4 font-semibold uppercase text-xs">Hình ảnh</th>
                        <th className="p-4 font-semibold uppercase text-xs">Tên sản phẩm</th>
                        <th className="p-4 font-semibold uppercase text-xs">Mô tả</th>
                        <th className="p-4 font-semibold uppercase text-xs">Thời gian cào</th>
                        <th className="p-4 font-semibold uppercase text-xs text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProducts.map(product => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="p-4"><input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                          <td className="p-4"><img src={product.image_url} alt="img" className="w-16 h-16 object-cover rounded border bg-white" /></td>
                          <td className="p-4 font-medium text-gray-900 max-w-xs">{product.product_name} <br/><span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full mt-1 inline-block">{product.product_type}</span></td>
                          <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{product.description}</td>
                          <td className="p-4 text-sm text-gray-500 font-semibold">{product.created_at ? new Date(product.created_at).toLocaleString('vi-VN') : '---'}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors">Sửa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE */}
          {activeTab === 'manage' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sản phẩm đang hiển thị</h3>
                {selectedIds.length > 0 && (
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete' })} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded font-bold transition-colors">Xóa vĩnh viễn ({selectedIds.length})</button>
                    <button onClick={() => setConfirmDialog({ isOpen: true, type: 'hide' })} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded font-bold transition-colors shadow-sm">Ẩn khỏi Web ({selectedIds.length})</button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
              ) : approvedProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium">Chưa có sản phẩm nào được hiển thị trên Website.</div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-800 border-b border-emerald-200">
                        <th className="p-4 w-12"><input type="checkbox" className="w-5 h-5 accent-emerald-600 cursor-pointer" onChange={(e) => setSelectedIds(e.target.checked ? approvedProducts.map(p => p.id) : [])} checked={selectedIds.length === approvedProducts.length && approvedProducts.length > 0} /></th>
                        <th className="p-4 font-semibold uppercase text-xs">Hình ảnh</th>
                        <th className="p-4 font-semibold uppercase text-xs">Tên sản phẩm</th>
                        <th className="p-4 font-semibold uppercase text-xs">Nhà SX</th>
                        <th className="p-4 font-semibold uppercase text-xs text-center">Trạng thái</th>
                        <th className="p-4 font-semibold uppercase text-xs text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedProducts.map(product => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-emerald-50/50 transition-colors">
                          <td className="p-4"><input type="checkbox" className="w-5 h-5 accent-emerald-600 cursor-pointer" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                          <td className="p-4"><img src={product.image_url} alt="img" className="w-16 h-16 object-cover rounded border bg-white" /></td>
                          <td className="p-4 font-medium text-gray-900 max-w-sm">{product.product_name}</td>
                          <td className="p-4 text-sm text-gray-600">{product.manufacturer}</td>
                          <td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs">Đang hiển thị</span></td>
                          <td className="p-4 text-center">
                            <button onClick={() => openEditModal(product)} className="text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded transition-colors mr-2">Sửa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ĐĂNG THỦ CÔNG */}
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
                      <button type="button" onClick={() => setImageInputMode('url')} className={`px-3 py-1 text-xs font-bold rounded ${imageInputMode === 'url' ? 'bg-white text-[#f26522] shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Nhập URL</button>
                      <button type="button" onClick={() => setImageInputMode('upload')} className={`px-3 py-1 text-xs font-bold rounded ${imageInputMode === 'upload' ? 'bg-white text-[#f26522] shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Tải file lên</button>
                    </div>
                  </div>

                  {imageInputMode === 'url' ? (
                    <div className="flex gap-3 items-start">
                      <input type="url" required placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522]" />
                      {formData.image_url && (
                        <div className="w-12 h-12 flex-shrink-0 border border-gray-200 rounded overflow-hidden bg-gray-50 shadow-sm">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=L%E1%BB%97i' }} 
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <span className="text-2xl mb-2">📁</span>
                        <span className="text-sm text-gray-600 font-semibold">Nhấn để chọn ảnh từ máy</span>
                      </label>
                      {isUploadingImage && <p className="text-sm text-blue-600 mt-2 font-bold animate-pulse">Đang tải ảnh lên máy chủ Cloud...</p>}
                      {formData.image_url && imageInputMode === 'upload' && !isUploadingImage && (
                        <div className="mt-2 flex flex-col items-center">
                          <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded border border-gray-200 mb-1" />
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
                  <button type="button" onClick={addSpecField} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold transition-colors">+ Thêm thông số</button>
                </div>
                {specs.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Chưa có thông số nào.</p>
                ) : (
                  <div className="space-y-3">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex gap-3">
                        <input type="text" placeholder="Tên (VD: RAM)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className="w-1/3 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f26522]" />
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

        {/* ================= MODAL CUSTOM CONFIRM ================= */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
                  ${confirmDialog.type === 'approve' ? 'bg-blue-50 text-blue-600' : 
                    confirmDialog.type === 'hide' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                  {confirmDialog.type === 'approve' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                  {confirmDialog.type === 'hide' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                  {confirmDialog.type === 'delete' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmDialog.type === 'approve' ? 'Xác nhận Duyệt bài' : 
                   confirmDialog.type === 'hide' ? 'Xác nhận Ẩn sản phẩm' : 'Xác nhận Xóa dữ liệu'}
                </h3>
                <p className="text-gray-500 mb-8 text-sm">
                  Bạn có chắc chắn muốn {confirmDialog.type === 'approve' ? 'hiển thị' : confirmDialog.type === 'hide' ? 'đưa về kho chờ duyệt' : 'xóa vĩnh viễn'} <strong className="text-gray-900 text-lg">{selectedIds.length}</strong> sản phẩm?
                </p>
                
                <div className="flex w-full gap-3">
                  <button onClick={() => setConfirmDialog({ isOpen: false, type: null })} className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                  <button onClick={executeConfirmAction} className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-colors shadow-md 
                    ${confirmDialog.type === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : 
                      confirmDialog.type === 'hide' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {confirmDialog.type === 'approve' ? 'Duyệt bài' : confirmDialog.type === 'hide' ? 'Ẩn ngay' : 'Xóa ngay'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL UPDATE SẢN PHẨM ================= */}
        {isUpdateModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800">Cập nhật Sản Phẩm: {editingProduct.product_name}</h2>
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
                      <div className="flex gap-3 items-start">
                        <input 
                          type="url" 
                          required 
                          value={editFormData.image_url} 
                          onChange={e => setEditFormData({...editFormData, image_url: e.target.value})} 
                          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600" 
                        />
                        {editFormData.image_url && (
                          <div className="w-12 h-12 flex-shrink-0 border border-gray-200 rounded overflow-hidden bg-gray-50 shadow-sm">
                            <img 
                              src={editFormData.image_url} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=L%E1%BB%97i' }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả sản phẩm</label>
                    <textarea rows={3} value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600 resize-y"></textarea>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-800">Thông số kỹ thuật</h4>
                      <button type="button" onClick={addEditSpecField} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold">+ Thêm thông số</button>
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
                    <button type="submit" className="px-6 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition-colors">Lưu Thay Đổi</button>
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