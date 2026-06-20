import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// BƯỚC 1: IMPORT CONFIG API
import { API_CONFIG, buildApiUrl } from '../../constants/config';

interface Product {
  id: string;
  product_name: string;
  image_url: string;
  description: string;
  manufacturer: string;
  product_type: string;
  specifications?: string | null; // Đón chuỗi JSON từ Backend
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
 

  useEffect(() => {
    const fetchApprovedProducts = async () => {
      setIsLoading(true);
      try {
        // BƯỚC 2: GỌI API QUA GATEWAY
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

  const filteredProducts = products.filter(product => {
    if (!categoryParam) return true; 
    
    switch (categoryParam) {
      case 'pc': return product.product_type === 'Thiết bị máy tính';
      case 'components': return product.product_type === 'Linh kiện';
      case 'mobile': return product.product_type === 'Điện thoại, thiết bị thông minh';
      case 'solutions': return product.product_type === 'Giải pháp CNTT';
      default: return true;
    }
  });

  const getCategoryTitle = () => {
    switch (categoryParam) {
      case 'pc': return 'Thiết bị máy tính';
      case 'components': return 'Linh kiện, thiết bị ngoại vi';
      case 'mobile': return 'Điện thoại, thiết bị thông minh';
      case 'solutions': return 'Giải pháp CNTT';
      default: return 'Tất cả sản phẩm';
    }
  };

  // Hàm Helper bóc tách JSON an toàn, chống crash ứng dụng
  const parseSpecifications = (specsString?: string | null) => {
    if (!specsString) return null;
    try {
      return JSON.parse(specsString);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto">
        
        <div className="mb-12 text-center md:text-left border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#16223f] uppercase tracking-wide">
            {getCategoryTitle()}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Hiển thị {filteredProducts.length} sản phẩm
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f26522]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-500">Các sản phẩm thuộc danh mục này đang được cập nhật.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => {
              // Bóc tách JSON cho từng sản phẩm
              const specsObj = parseSpecifications(product.specifications);
              // Lấy tối đa 3 key đầu tiên để render preview
              const specKeys = specsObj ? Object.keys(specsObj).slice(0, 3) : [];

              return (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col">
                  
                  <div className="relative h-64 overflow-hidden bg-white flex items-center justify-center p-4">
                    <img 
                      src={product.image_url} 
                      alt={product.product_name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* KHỐI HIỂN THỊ NHÀ SẢN XUẤT ĐÃ ĐƯỢC XÓA TẠI ĐÂY */}
                  </div>

                  <div className="p-6 flex flex-col flex-1 border-t border-gray-100">
                    <span className="text-xs font-bold text-[#f26522] uppercase tracking-widest mb-2">
                      {product.product_type}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
                      {product.product_name}
                    </h3>
                    
                    {/* KHU VỰC HIỂN THỊ THÔNG SỐ (JSON PARSED) */}
                    {specKeys.length > 0 ? (
                      <div className="mb-4 space-y-1">
                        {specKeys.map(key => (
                          <div key={key} className="text-xs text-gray-600 flex justify-between border-b border-gray-50 pb-1">
                            <span className="font-semibold">{key}:</span>
                            <span className="text-gray-800 truncate pl-2 max-w-[60%]">{specsObj[key]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                        {product.description}
                      </p>
                    )}
                    
                    <button className="w-full bg-gray-100 hover:bg-[#f26522] hover:text-white text-gray-800 font-bold py-3 rounded transition-colors mt-auto">
                      Chi tiết sản phẩm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}