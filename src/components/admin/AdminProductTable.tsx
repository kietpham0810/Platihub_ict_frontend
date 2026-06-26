import React from 'react';
import type { Product, BotReport } from './types';

interface AdminProductTableProps {
  activeTab: 'review' | 'manual' | 'manage';
  pendingProducts: Product[];
  approvedProducts: Product[];
  selectedIds: string[];
  isLoading: boolean;
  botReport: BotReport | null;
  isBotRunning: boolean;
  crawlUrl: string;
  setActiveTab: React.Dispatch<React.SetStateAction<'review' | 'manual' | 'manage'>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<{ isOpen: boolean; type: 'approve' | 'delete' | 'hide' | null }>>;
  openEditModal: (product: Product) => void;
  handleRunBot: () => Promise<void>;
  toggleSelect: (id: string) => void;
  setCrawlUrl: React.Dispatch<React.SetStateAction<string>>; // 🚨 KHAI BÁO BẮT BUỘC ĐỂ NHẬN DỮ LIỆU
}

export default function AdminProductTable({
  activeTab,
  pendingProducts,
  approvedProducts,
  selectedIds,
  isLoading,
  botReport,
  isBotRunning,
  crawlUrl,
  setActiveTab,
  setSelectedIds,
  setConfirmDialog,
  openEditModal,
  handleRunBot,
  toggleSelect,
  setCrawlUrl, // 🚨 NHẬN HÀM TỪ FILE GỐC
}: AdminProductTableProps) {
  return (
    <>
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

        <div className="p-3 md:p-0 flex flex-col md:flex-row items-center gap-3 justify-end md:ml-4">
          <div className="w-full md:w-64">
            <input
              type="url"
              placeholder="Dán link Hoàng Hà PC vào đây..."
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)} // 🚨 SẼ KHÔNG CÒN BỊ LỖI
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {botReport && (
            <div className="text-right hidden xl:block shrink-0">
              <p className="text-[11px] text-green-600 font-bold">✨ Tìm thấy {botReport.total_links_found} mục</p>
              <p className="text-[10px] text-gray-400">Thêm mới: {botReport.new_inserted} | Cập nhật: {botReport.updated_specifications}</p>
            </div>
          )}

          <button
            onClick={handleRunBot}
            disabled={isBotRunning}
            className={`shrink-0 px-4 py-2 rounded-lg font-bold text-xs md:text-sm shadow flex items-center gap-2 transition-all ${isBotRunning ? 'bg-gray-200 text-gray-400 cursor-not-allowed animate-pulse' : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800'}`}
          >
            <span>{isBotRunning ? '⚙️' : '🤖'}</span>
            {isBotRunning ? 'Đang Quét...' : 'Quét Link Này'}
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
                        <td className="p-4">
                          <img 
                            src={product.image_url} 
                            alt="img" 
                            className="w-16 h-16 object-cover rounded border bg-white" 
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement; 
                              target.onerror = null; 
                              target.src = 'https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'; 
                            }} 
                          />
                        </td>
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
                        <td className="p-4">
                          <img 
                            src={product.image_url} 
                            alt="img" 
                            className="w-16 h-16 object-cover rounded border bg-white" 
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement; 
                              target.onerror = null; 
                              target.src = 'https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'; 
                            }} 
                          />
                        </td>
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
      </div>
    </>
  );
}