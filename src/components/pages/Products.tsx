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
  specifications?: string | Record<string, any> | null;
}

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
  { label: 'Tai nghe', value: 'Tai nghe' },
].sort((a,b) => a.label.localeCompare(b.label));

const ADVANCED_FILTER_CONFIG: Record<string, Record<string, string>> = {
  'PC': { 'Hãng sản xuất': 'manufacturer', 'Nhu cầu': 'Nhu cầu', 'CPU': 'CPU', 'RAM': 'RAM', 'Ổ cứng': 'Ổ cứng' },
  'Laptop': { 'Hãng sản xuất': 'manufacturer', 'CPU': 'CPU', 'RAM': 'RAM', 'Ổ cứng': 'Ổ cứng' },
  'Màn hình máy tính': { 'Hãng sản xuất': 'manufacturer', 'Kích thước': 'Kích thước', 'Tần số quét': 'Tần số quét', 'Độ phân giải': 'Độ phân giải' },
  'CPU': { 'Hãng sản xuất': 'manufacturer', 'Socket': 'Socket' },
  'VGA': { 'Hãng sản xuất': 'manufacturer', 'Dung lượng VRAM': 'Dung lượng VRAM' },
  'Tai nghe': { 'Thương hiệu': 'Thương hiệu', 'Kiểu kết nối': 'Kiểu kết nối' },
};

const PRICE_RANGES = [
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
  { label: 'Từ 4 - 7 triệu', min: 4000000, max: 7000000 },
  { label: 'Từ 7 - 13 triệu', min: 7000000, max: 13000000 },
  { label: 'Từ 13 - 20 triệu', min: 13000000, max: 20000000 },
  { label: 'Trên 20 triệu', min: 20000000, max: Infinity },
];

const parseSpecs = (product: Product): Record<string, any> => {
  if (!product.specifications) return {};
  try {
    return typeof product.specifications === 'string'
      ? JSON.parse(product.specifications)
      : product.specifications;
  } catch {
    return {};
  }
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, (string | number)[]>>({});

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchKeyword = searchParams.get('search');

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

  const handleCategorySelect = (categoryValue: string | null) => {
    setSearchParams(prev => {
      if (categoryValue) {
        prev.set('category', categoryValue);
      } else {
        prev.delete('category');
      }
      return prev;
    }, { replace: true });
    clearAllFilters();
  };

  const currentCategory = categoryParam || null;
  const filterableSpecs = ADVANCED_FILTER_CONFIG[currentCategory || ''] || {};

  const availableSpecFilters = useMemo(() => {
    const productsToFilter = currentCategory ? products.filter(p => p.product_type === currentCategory) : products;

    const options: Record<string, Set<string | number>> = {};
    if (!currentCategory) return {};

    // Always include price filter
    options['Mức giá'] = new Set(PRICE_RANGES.map((_, idx) => idx));

    Object.keys(filterableSpecs).forEach(key => {
      options[key] = new Set();
    });

    for (const product of productsToFilter) {
      const specs = parseSpecs(product);
      for (const label in filterableSpecs) {
        const specKey = filterableSpecs[label];
        const value = specKey === 'manufacturer' ? product.manufacturer : specs[specKey];
        if (value) {
          (options[label] as Set<string>).add(value);
        }
      }
    }

    const result: Record<string, (string | { label: string; value: number })[]> = {};
    for (const label in options) {
      if (label === 'Mức giá') {
        result[label] = PRICE_RANGES.map((r, i) => ({ label: r.label, value: i }));
      } else if (options[label].size > 0) {
        result[label] = Array.from(options[label] as Set<string>).sort();
      }
    }

    return result;
  }, [products, currentCategory, filterableSpecs]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (currentCategory && product.product_type !== currentCategory) {
        return false;
      }
      if (searchKeyword) {
        const lowerKeyword = searchKeyword.toLowerCase().trim();
        const searchTerms = lowerKeyword.split(/\s+/).filter(Boolean);
        const productText = [
          product.product_name, product.manufacturer, product.product_type, product.description, JSON.stringify(product.specifications)
        ].join(' ').toLowerCase();
        if (!searchTerms.every(term => productText.includes(term))) return false;
      }

      const specs = parseSpecs(product);
      for (const filterLabel in activeFilters) {
        const activeValues = activeFilters[filterLabel];
        if (activeValues.length === 0) continue;

        if (filterLabel === 'Mức giá') {
          const price = product.price || 0;
          if (!activeValues.some(idx => {
            const range = PRICE_RANGES[idx as number];
            return price >= range.min && price < range.max;
          })) return false;
          continue;
        }

        const specKey = filterableSpecs[filterLabel];
        const productValue = specKey === 'manufacturer' ? product.manufacturer : specs[specKey];
        if (!productValue || !activeValues.includes(productValue)) {
          return false;
        }
      }

      return true;
    });
  }, [products, currentCategory, searchKeyword, activeFilters, filterableSpecs]);

  const toggleFilter = (label: string, value: string | number) => {
    setActiveFilters(prev => {
      const currentValues = prev[label] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [label]: newValues };
    });
  };

  const clearAllFilters = () => setActiveFilters({});
  const getActiveFilterCount = () => Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);
  const getCategoryTitle = () => searchKeyword ? `Tìm kiếm: "${searchKeyword}"` : currentCategory || 'Tất cả sản phẩm';

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight mb-4 md:mb-0">
            {getCategoryTitle()}
          </h1>
          {currentCategory && (
             <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-700 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Bộ lọc {getActiveFilterCount() > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{getActiveFilterCount()}</span>}
            </button>
          )}
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit w-56 gap-2">
            <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wide">Danh mục</h3>
             <button onClick={() => handleCategorySelect(null)} className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${!currentCategory ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>Tất cả sản phẩm</button>
            {PRODUCT_CATEGORIES.map(category => (
              <button key={category.value} onClick={() => handleCategorySelect(category.value)} className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${currentCategory === category.value ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                {category.label}
              </button>
            ))}
          </div>

        {isLoading ? (
          <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1">
            <div className="text-7xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-gray-500 mt-2">Thử bỏ bớt bộ lọc hoặc thay đổi từ khóa tìm kiếm.</p>
            <button onClick={clearAllFilters} className="mt-6 text-blue-600 font-bold hover:underline">Xóa tất cả bộ lọc</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1">
            {filteredProducts.map(product => {
              const specs = parseSpecs(product);
              const specKeys = specs ? Object.keys(specs).slice(0, 4) : [];

              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                  <div className="relative aspect-square p-4 flex items-center justify-center bg-white border-b border-gray-50">
                    <img src={product.image_url} alt={product.product_name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src='https://placehold.co/400x300/f8f9fa/a1a1aa?text=No+Image'}} />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">{product.product_name}</h3>
                    <div className="flex flex-wrap gap-1 mb-4 mt-1">
                      {specKeys.map(key => <span key={key} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border border-gray-200 truncate max-w-full">{specs[key]}</span>)}
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <span className="text-lg font-black text-[#f26522]">{product.price ? `${product.price.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}</span>
                      <Link to={`/product/${product.id}`} className="w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors text-sm">Xem chi tiết</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">Bộ lọc cho {currentCategory}</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              {Object.keys(availableSpecFilters).map(label => (
                <div key={label}>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">{label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(availableSpecFilters[label] as any[]).map((option) => {
                      const value = typeof option === 'object' ? option.value : option;
                      const displayLabel = typeof option === 'object' ? option.label : option;
                      const isActive = (activeFilters[label] || []).includes(value);

                      return (
                        <button key={value} onClick={() => toggleFilter(label, value)} className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${isActive ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center rounded-b-2xl">
              <button onClick={clearAllFilters} disabled={getActiveFilterCount() === 0} className={`px-6 py-3 font-bold rounded-lg transition-colors ${getActiveFilterCount() > 0 ? 'text-red-500 border border-red-200 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}>
                Bỏ chọn ({getActiveFilterCount()})
              </button>
              <button onClick={() => setIsFilterModalOpen(false)} className="bg-[#f26522] hover:bg-[#d9531e] text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors">
                Xem {filteredProducts.length} kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}