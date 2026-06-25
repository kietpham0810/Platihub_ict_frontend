import React, { useState, useEffect } from 'react';
import { API_CONFIG, buildApiUrl } from '../../constants/config';
import AdminProductTable from './AdminProductTable';
import AdminProductManual from './AdminProductManual';

export interface Product {
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

export interface SpecField {
  key: string;
  value: string;
}

export default function AdminProduct() {
  const [activeTab, setActiveTab] = useState<'review' | 'manual' | 'manage'>('review');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ================= STATE CHO BOT ON-DEMAND =================
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botReport, setBotReport] = useState<any>(null);
  const [crawlUrl, setCrawlUrl] = useState<string>(''); 

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

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notification]);

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

  // ================= ĐIỀU KHIỂN BOT THEO YÊU CẦU =================
  const executeBotCrawl = async (url: string, offset: number = 0) => {
    setIsBotRunning(true);
    try {
      const response = await fetch(`${buildApiUrl('/bot_sync_hoanghapc.php')}?url=${encodeURIComponent(url)}&offset=${offset}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setBotReport(data.data);
        fetchProducts(); 
        
        if (data.has_more) {
          const wantMore = window.confirm(`Đã cào xong 5 sản phẩm (Tổng cộng: ${data.total_links} sản phẩm trên trang).\nBạn có muốn tiếp tục cào 5 sản phẩm tiếp theo không?`);
          if (wantMore) {
            executeBotCrawl(url, data.next_offset);
          } else {
            alert("Đã dừng quá trình cào dữ liệu.");
            setIsBotRunning(false);
            setCrawlUrl('');
          }
        } else {
          alert("Tuyệt vời! Đã quét sạch 100% sản phẩm trong link này.");
          setIsBotRunning(false);
          setCrawlUrl('');
        }
      } else {
        alert('Cảnh báo từ Động cơ Bot: ' + data.message);
        setIsBotRunning(false);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ Backend.');
      setIsBotRunning(false);
    }
  };

  const handleRunBot = async () => {
    if (!crawlUrl.trim()) {
      alert("Vui lòng dán link Hoàng Hà PC vào ô trước khi chạy Bot!");
      return;
    }
    setBotReport(null);
    executeBotCrawl(crawlUrl, 0); 
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

  // ================= QUẢN LÝ THÔNG SỐ =================
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

  const executeConfirmAction = async () => {
    if (!confirmDialog.type) return;
    
    let endpoint = '';
    if (confirmDialog.type === 'approve') endpoint = API_CONFIG.ENDPOINTS.APPROVE_PRODUCT;
    else if (confirmDialog.type === 'delete') endpoint = API_CONFIG.ENDPOINTS.DELETE_PRODUCT;
    else if (confirmDialog.type === 'hide') endpoint = API_CONFIG.ENDPOINTS.HIDE_PRODUCT;

    try {
      let hasError = false;
      let errorMessage = "";

      for (const id of selectedIds) {
        const response = await fetch(buildApiUrl(endpoint), {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id })
        });

        if (!response.ok) {
          hasError = true;
          errorMessage = `HTTP ${response.status}`;
          break; 
        }

        const result = await response.json();
        if (result.status === 'error') {
          hasError = true;
          errorMessage = result.message;
          break;
        }
      }

      if (hasError) {
        setNotification({
          type: 'error',
          title: 'Thao tác không thành công',
          message: errorMessage || 'Đã có lỗi xảy ra khi xử lý sản phẩm.',
        });
      } else {
        setSelectedIds([]);
        fetchProducts();
        setNotification({
          type: 'success',
          title: 'Hoàn tất',
          message: confirmDialog.type === 'approve'
            ? `${selectedIds.length} sản phẩm đã được duyệt thành công.`
            : confirmDialog.type === 'hide'
              ? `${selectedIds.length} sản phẩm đã được ẩn khỏi website.`
              : `${selectedIds.length} sản phẩm đã bị xóa vĩnh viễn.`,
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Lỗi kết nối',
        message: 'Đường truyền API bị lỗi. Vui lòng thử lại sau.',
      });
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
        
        {/* 🚨 TÁCH GIAO DIỆN CHUẨN KỸ SƯ */}
        <AdminProductTable
          activeTab={activeTab}
          pendingProducts={pendingProducts}
          approvedProducts={approvedProducts}
          selectedIds={selectedIds}
          isLoading={isLoading}
          botReport={botReport}
          isBotRunning={isBotRunning}
          crawlUrl={crawlUrl}
          setActiveTab={setActiveTab}
          setSelectedIds={setSelectedIds}
          setConfirmDialog={setConfirmDialog}
          openEditModal={openEditModal}
          handleRunBot={handleRunBot}
          toggleSelect={toggleSelect}
          setCrawlUrl={setCrawlUrl}  // 🚨 THÊM CÁI NÀY ĐỂ KHÔNG BỊ LỖI STATUS 1
        />

        <div className="p-8">
          
          {/* TAB 3: ĐĂNG THỦ CÔNG */}
          {activeTab === 'manual' && (
            <AdminProductManual
              formData={formData}
              imageInputMode={imageInputMode}
              isUploadingImage={isUploadingImage}
              specs={specs}
              setFormData={setFormData}
              setImageInputMode={setImageInputMode}
              handleImageUpload={handleImageUpload}
              addSpecField={addSpecField}
              removeSpecField={removeSpecField}
              handleSpecChange={handleSpecChange}
              handleManualSubmit={handleManualSubmit}
            />
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

        {notification && (
          <div className="fixed right-4 top-6 z-50 w-full max-w-sm">
            <div className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${notification.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  {notification.type === 'success' ? (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">{notification.title}</p>
                  <p className="text-sm leading-5">{notification.message}</p>
                </div>
                <button onClick={() => setNotification(null)} className="text-current opacity-80 hover:opacity-100 text-xl leading-none">×</button>
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
                              onError={(e) => { 
                                const target = e.target as HTMLImageElement; 
                                target.onerror = null; 
                                target.src = 'https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'; 
                              }} 
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