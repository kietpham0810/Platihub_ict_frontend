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
  const [specs, setSpecs] = useState<SpecField[]>([]);

  // ================= STATES CHO MODAL UPDATE =================
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    product_name: '', manufacturer: '', product_type: '', image_url: '', description: ''
  });
  const [editSpecs, setEditSpecs] = useState<SpecField[]>([]);

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

  // ================= 2. QUẢN LÝ SPECIFICATIONS (MANUAL) =================
  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecField = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  // ================= 3. QUẢN LÝ SPECIFICATIONS (EDIT MODAL) =================
  const addEditSpecField = () => setEditSpecs([...editSpecs, { key: '', value: '' }]);
  const removeEditSpecField = (index: number) => setEditSpecs(editSpecs.filter((_, i) => i !== index));
  const handleEditSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...editSpecs];
    newSpecs[index][field] = value;
    setEditSpecs(newSpecs);
  };

  // ================= 4. LUỒNG SỬA SẢN PHẨM =================
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

  // ================= 5. DUYỆT / XÓA / THÊM MỚI =================
  const handleApprove = async () => {
    if (!window.confirm(`Bạn muốn duyệt hiển thị ${selectedIds.length} sản phẩm này?`)) return;
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(buildApiUrl(API_CONFIG.ENDPOINTS.APPROVE_PRODUCT), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
        })
      ));
      alert('Đã duyệt sản phẩm thành công!');
      setSelectedIds([]);
      fetchPendingProducts();
    } catch (error) {
      alert('Có lỗi xảy ra khi duyệt sản phẩm.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xóa vĩnh viễn ${selectedIds.length} sản phẩm này khỏi hệ thống?`)) return;
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(buildApiUrl(API_CONFIG.ENDPOINTS.DELETE_PRODUCT), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
        })
      ));
      alert('Đã xóa thành công!');
      setSelectedIds([]);
      fetchPendingProducts();
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa sản phẩm.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                    <button onClick={handleDelete} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded font-bold transition-colors">Xóa bỏ ({selectedIds.length})</button>
                    <button onClick={handleApprove} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-bold transition-colors shadow-sm">Duyệt & Đăng bài ({selectedIds.length})</button>
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">URL Hình ảnh *</label>
                  <input type="url" required placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả sản phẩm</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#f26522] resize-y"></textarea>
              </div>

              {/* JSON DYNAMIC */}
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
                <button type="submit" className="bg-[#f26522] hover:bg-[#d9531e] text-white font-bold py-3 px-8 rounded shadow-md transition-colors">Xuất bản Sản phẩm</button>
              </div>
            </form>
          )}
        </div>

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