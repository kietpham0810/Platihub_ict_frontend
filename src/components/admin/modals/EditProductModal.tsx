import React from 'react';
import type { Product, ProductFormData, SpecField } from '../types';
import { PRODUCT_CATEGORY_OPTIONS } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  editFormData: ProductFormData;
  setEditFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  editSpecs: SpecField[];
  addEditSpecField: () => void;
  removeEditSpecField: (index: number) => void;
  handleEditSpecChange: (index: number, field: 'key' | 'value', value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditProductModal({
  isOpen,
  editingProduct,
  editFormData,
  setEditFormData,
  editSpecs,
  addEditSpecField,
  removeEditSpecField,
  handleEditSpecChange,
  onClose,
  onSubmit,
}: EditProductModalProps) {
  if (!isOpen || !editingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Cập nhật Sản Phẩm: {editingProduct.product_name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">✕</button>
        </div>

        <div className="p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm *</label>
                <input type="text" required value={editFormData.product_name} onChange={e => setEditFormData({ ...editFormData, product_name: e.target.value })} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nhà sản xuất *</label>
                <input type="text" required value={editFormData.manufacturer} onChange={e => setEditFormData({ ...editFormData, manufacturer: e.target.value })} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phân loại *</label>
                <select required value={editFormData.product_type} onChange={e => setEditFormData({ ...editFormData, product_type: e.target.value })} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600 bg-white">
                  <option value="">-- Chọn phân loại --</option>
                  {PRODUCT_CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Hình ảnh *</label>
                <div className="flex gap-3 items-start">
                  <input
                    type="url"
                    required
                    value={editFormData.image_url}
                    onChange={e => setEditFormData({ ...editFormData, image_url: e.target.value })}
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
              <textarea rows={3} value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-600 resize-y"></textarea>
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
              <button type="button" onClick={onClose} className="px-6 py-2 rounded font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors">Hủy</button>
              <button type="submit" className="px-6 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow transition-colors">Lưu Thay Đổi</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
