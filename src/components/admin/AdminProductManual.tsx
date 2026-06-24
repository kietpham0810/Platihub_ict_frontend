import React from 'react';
import { SpecField } from './AdminProduct';

interface AdminProductManualProps {
  formData: {
    product_name: string;
    manufacturer: string;
    product_type: string;
    image_url: string;
    description: string;
  };
  imageInputMode: 'url' | 'upload';
  isUploadingImage: boolean;
  specs: SpecField[];
  setFormData: React.Dispatch<React.SetStateAction<{
    product_name: string;
    manufacturer: string;
    product_type: string;
    image_url: string;
    description: string;
  }>>;
  setImageInputMode: React.Dispatch<React.SetStateAction<'url' | 'upload'>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  addSpecField: () => void;
  removeSpecField: (index: number) => void;
  handleSpecChange: (index: number, field: 'key' | 'value', value: string) => void;
  handleManualSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function AdminProductManual({
  formData,
  imageInputMode,
  isUploadingImage,
  specs,
  setFormData,
  setImageInputMode,
  handleImageUpload,
  addSpecField,
  removeSpecField,
  handleSpecChange,
  handleManualSubmit,
}: AdminProductManualProps) {
  return (
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
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement; 
                      target.onerror = null; 
                      target.src = 'https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'; 
                    }} 
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
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded border border-gray-200 mb-1" 
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement; 
                      target.onerror = null; 
                      target.src = 'https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'; 
                    }} 
                  />
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
  );
}
