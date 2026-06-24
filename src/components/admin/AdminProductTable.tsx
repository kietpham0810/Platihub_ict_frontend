import React from 'react';
import type { Product } from './AdminProduct';

interface AdminProductTableProps {
  activeTab: 'review' | 'manual' | 'manage';
  pendingProducts: Product[];
  approvedProducts: Product[];
  selectedIds: string[];
  isLoading: boolean;
  botReport: any;
  isBotRunning: boolean;
  crawlUrl: string;
  setActiveTab: React.Dispatch<React.SetStateAction<'review' | 'manual' | 'manage'>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<{ isOpen: boolean; type: 'approve' | 'delete' | 'hide' | null }>>;
  openEditModal: (product: Product) => void;
  handleRunBot: () => Promise<void>;
  toggleSelect: (id: string) => void;
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
}: AdminProductTableProps) {
  return (
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
            onChange={(e) => setCrawlUrl(e.target.value)}
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
  );
}
