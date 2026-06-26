import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_CONFIG, buildApiUrl } from '../../constants/config';

interface Product {
  id: string;
  product_name: string;
  image_url: string;
  description: string;
  manufacturer: string;
  product_type: string;
  price?: number | null;
  specifications?: string | null;
}

// ================= CẤU HÌNH CÁC TẦNG LỌC (TGDD STYLE) =================
const PRODUCT_CATEGORIES = [
  { label: 'PC', value: 'PC' },
  { label: 'Laptop', value: 'Laptop' },
  { label: 'CPU', value: 'CPU' },
  { label: 'Mainboard', value: 'Mainboard' },
  { label: 'VGA', value: 'VGA' },
  { label: 'Linh kiện máy tính', value: 'Linh kiện' },
  { label: 'Màn hình máy tính', value: 'Màn hình' },
  { label: 'HDD-SSD', value: 'HDD-SSD' },
  { label: 'Tản Nhiệt', value: 'Tản Nhiệt' },
];

const FILTER_CONFIG = {
  prices: [
    { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
    { label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
    { label: 'Từ 4 - 7 triệu', min: 4000000, max: 7000000 },
    { label: 'Từ 7 - 13 triệu', min: 7000000, max: 13000000 },
    { label: 'Từ 13 - 20 triệu', min: 13000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: 999999999 },
  ],
  rams: ['4 GB', '8 GB', '16 GB', '32 GB'],
  storages: ['128 GB', '256 GB', '512 GB', '1 TB'],
  cpus: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7']
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trạng thái phân loại sản phẩm
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Trạng thái bật/tắt Modal Lọc
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // STATE: Quản trị bộ lọc đang được chọn
  const [activeFilters, setActiveFilters] = useState<{
    manufacturers: string[];
    prices: number[]; // Lưu index của mảng FILTER_CONFIG.prices
    rams: string[];
    storages: string[];
    cpus: string[];
  }>({
    manufacturers: [],
    prices: [],
    rams: [],
    storages: [],
    cpus: []
  });

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchKeyword = searchParams.get('search');

  // KÉO DỮ LIỆU TỪ API
  useEffect(() => {
    const fetchApprovedProducts = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS)}?status=approved`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Lỗi kết nối mạng');
        
        const data = await response.json();
        if (data.status === 'success') {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApprovedProducts();
  }, []);

  // Tự động trích xuất danh sách Hãng sản xuất từ dữ liệu thực tế
  const availableManufacturers = useMemo(() => {
    const brands = products.map(p => p.manufacturer?.trim()).filter(Boolean);
    return Array.from(new Set(brands));
  }, [products]);

  // ================= BỘ ĐỘNG CƠ LỌC LÕI (CORE FILTERING ENGINE) =================
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 0. Tầng Phân loại sản phẩm (Sidebar)
      if (selectedCategory && product.product_type !== selectedCategory) {
        return false;
      }

      // 1. Tầng URL (Category & Search)
      if (categoryParam) {
        let matchCategory = false;
        switch (categoryParam) {
          case 'pc': matchCategory = product.product_type === 'Thiết bị máy tính'; break;
          case 'components': matchCategory = product.product_type === 'Linh kiện'; break;
          case 'mobile': matchCategory = product.product_type === 'Điện thoại, thiết bị thông minh'; break;
          case 'solutions': matchCategory = product.product_type === 'Giải pháp CNTT'; break;
        }
        if (!matchCategory) return false;
      }

      if (searchKeyword) {
        const lowerKeyword = searchKeyword.toLowerCase().trim();
        const searchTerms = lowerKeyword.split(/\s+/).filter(Boolean);
        const fields = [
          product.product_name || '',
          product.manufacturer || '',
          product.product_type || '',
          product.description || '',
          product.specifications ? String(product.specifications) : ''
        ].map(field => field.toLowerCase());

        const matchesSearch = searchTerms.every(term => fields.some(field => field.includes(term)));
        if (!matchesSearch) return false;
      }

      // 2. Tầng Hãng Sản Xuất (OR)
      if (activeFilters.manufacturers.length > 0) {
        if (!activeFilters.manufacturers.includes(product.manufacturer)) return false;
      }

      // 3. Tầng Giá (OR)
      if (activeFilters.prices.length > 0) {
        const price = product.price || 0;
        const matchPrice = activeFilters.prices.some(index => {
          const range = FILTER_CONFIG.prices[index];
          return price >= range.min && price <= range.max;
        });
        if (!matchPrice) return false;
      }

      // 4. Tầng Thông Số (Quét JSON)
      const rawSpecs = product.specifications ? product.specifications.toLowerCase() : '';
      
      // Lọc RAM (OR)
      if (activeFilters.rams.length > 0) {
        const matchRam = activeFilters.rams.some(ram => rawSpecs.includes(ram.toLowerCase()));
        if (!matchRam) return false;
      }

      // Lọc Storage (OR)
      if (activeFilters.storages.length > 0) {
        const matchStorage = activeFilters.storages.some(storage => rawSpecs.includes(storage.toLowerCase()));
        if (!matchStorage) return false;
      }

      // Lọc CPU (OR)
      if (activeFilters.cpus.length > 0) {
        const matchCpu = activeFilters.cpus.some(cpu => rawSpecs.includes(cpu.toLowerCase()));
        if (!matchCpu) return false;
      }

      return true; // Qua được mọi phễu thì cho hiển thị
    });
  }, [products, categoryParam, searchKeyword, activeFilters, selectedCategory]);

  // ================= HÀM XỬ LÝ SỰ KIỆN CLICK FILTER =================
  const toggleFilter = (category: keyof typeof activeFilters, value: string | number) => {
    setActiveFilters(prev => {
      const currentCategory = prev[category] as (string | number)[];
      if (currentCategory.includes(value)) {
        return { ...prev, [category]: currentCategory.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentCategory, value] };
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ manufacturers: [], prices: [], rams: [], storages: [], cpus: [] });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  // ================= UI HELPERS =================
  const getCategoryTitle = () => {
    if (searchKeyword) return `Tìm kiếm: "${searchKeyword}"`;
    switch (categoryParam) {
      case 'pc': return 'Thiết bị máy tính';
      case 'components': return 'Linh kiện PC';
      case 'mobile': return 'Điện thoại thông minh';
      case 'solutions': return 'Giải pháp CNTT';
      default: return 'Tất cả sản phẩm';
    }
  };

  const parseSpecifications = (specsString?: string | null) => {
    if (!specsString) return null;
    try { return JSON.parse(specsString); } catch { return null; }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER & FILTER BUTTON */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight mb-4 md:mb-0">
            {getCategoryTitle()}
          </h1>
          
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-700 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Bộ lọc nâng cao {getActiveFilterCount() > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{getActiveFilterCount()}</span>}
          </button>
        </div>

        {/* LAYOUT: SIDEBAR + CONTENT */}
        <div className="flex gap-6">
          {/* SIDEBAR PHÂN LOẠI (BẮN TRÁI) */}
          <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit w-56 gap-2">
            <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wide">Phân loại sản phẩm</h3>
            {PRODUCT_CATEGORIES.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(selectedCategory === category.value ? null : category.value)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                  selectedCategory === category.value 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {category.label}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-left px-4 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all mt-2"
              >
                ✕ Xóa lọc
              </button>
            )}
          </div>

        {/* LƯỚI SẢN PHẨM */}
        {isLoading ? (
          <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1">
            <div className="text-7xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-gray-500 mt-2">Thử bỏ bớt bộ lọc hoặc thay đổi từ khóa tìm kiếm.</p>
            <button onClick={() => { setSelectedCategory(null); clearAllFilters(); }} className="mt-6 text-blue-600 font-bold hover:underline">Xóa tất cả bộ lọc</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1">
            {filteredProducts.map(product => {
              const specsObj = parseSpecifications(product.specifications);
              const specKeys = specsObj ? Object.keys(specsObj).slice(0, 4) : [];

              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                  <div className="relative aspect-square p-4 flex items-center justify-center bg-white border-b border-gray-50">
                    <img 
                      src={product.image_url} 
                      alt={product.product_name} 
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement; 
                        target.onerror = null; 
                        target.src = 'https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'; 
                      }} 
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">{product.product_name}</h3>
                    
                    {/* Render thông số dạng chip nhỏ mờ */}
                    <div className="flex flex-wrap gap-1 mb-4 mt-1">
                      {specKeys.map(key => (
                        <span key={key} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200 truncate max-w-full">
                          {specsObj[key]}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                      <span className="text-lg font-black text-[#f26522]">
                        {product.price ? `${product.price.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
                      </span>
                      <Link 
                        to={`/product/${product.id}`} 
                        className="w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors text-sm"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* ================= MODAL LỌC (TGDD STYLE) ================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">Lọc Sản Phẩm</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body Modal (Nơi chứa các chip lọc) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              {/* Block Hãng */}
              {availableManufacturers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Hãng sản xuất</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableManufacturers.map(brand => (
                      <button
                        key={brand}
                        onClick={() => toggleFilter('manufacturers', brand)}
                        className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${activeFilters.manufacturers.includes(brand) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Block Giá */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Mức Giá</h3>
                <div className="flex flex-wrap gap-2">
                  {FILTER_CONFIG.prices.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleFilter('prices', idx)}
                      className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${activeFilters.prices.includes(idx) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block Cấu hình máy tính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Dung lượng RAM</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_CONFIG.rams.map(ram => (
                      <button
                        key={ram}
                        onClick={() => toggleFilter('rams', ram)}
                        className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${activeFilters.rams.includes(ram) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Ổ cứng / Lưu trữ</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_CONFIG.storages.map(storage => (
                      <button
                        key={storage}
                        onClick={() => toggleFilter('storages', storage)}
                        className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${activeFilters.storages.includes(storage) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Bộ Vi Xử Lý (CPU)</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_CONFIG.cpus.map(cpu => (
                      <button
                        key={cpu}
                        onClick={() => toggleFilter('cpus', cpu)}
                        className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${activeFilters.cpus.includes(cpu) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                      >
                        {cpu}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal (Nút hành động) */}
            <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center rounded-b-2xl">
              <button 
                onClick={clearAllFilters}
                className={`px-6 py-3 font-bold rounded-lg transition-colors ${getActiveFilterCount() > 0 ? 'text-red-500 border border-red-200 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}
                disabled={getActiveFilterCount() === 0}
              >
                Bỏ chọn
              </button>
              
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="bg-[#f26522] hover:bg-[#d9531e] text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors"
              >
                Xem {filteredProducts.length} kết quả
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}