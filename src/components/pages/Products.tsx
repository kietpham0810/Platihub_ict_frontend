import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_CONFIG, buildApiUrl } from '../../constants/config';

interface Product {
  id: string;
  product_name: string;
  image_url: string;
  description: string;
  manufacturer: string;
  product_type: string;
  specifications?: string | null;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchKeyword = searchParams.get('search'); // Bắt từ khóa từ Header truyền sang

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

  // Bộ máy lọc kép: Chạy qua phễu Danh mục, sau đó chạy qua phễu Tìm kiếm
  const filteredProducts = products.filter(product => {
    // 1. Lọc theo Category (Nếu có)
    let matchCategory = true;
    if (categoryParam) {
      switch (categoryParam) {
        case 'pc': matchCategory = product.product_type === 'Thiết bị máy tính'; break;
        case 'components': matchCategory = product.product_type === 'Linh kiện'; break;
        case 'mobile': matchCategory = product.product_type === 'Điện thoại, thiết bị thông minh'; break;
        case 'solutions': matchCategory = product.product_type === 'Giải pháp CNTT'; break;
        default: matchCategory = true;
      }
    }

    // 2. Lọc theo từ khóa Search (Nếu có)
    let matchSearch = true;
    if (searchKeyword) {
      const lowerKeyword = searchKeyword.toLowerCase();
      matchSearch = 
        (product.product_name && product.product_name.toLowerCase().includes(lowerKeyword)) ||
        (product.manufacturer && product.manufacturer.toLowerCase().includes(lowerKeyword));
    }

    return matchCategory && matchSearch;
  });

  // Tự động điều chỉnh Tiêu đề trang dựa trên ngữ cảnh
  const getCategoryTitle = () => {
    if (searchKeyword) return `Kết quả tìm kiếm: "${searchKeyword}"`;
    
    switch (categoryParam) {
      case 'pc': return 'Thiết bị máy tính';
      case 'components': return 'Linh kiện, thiết bị ngoại vi';
      case 'mobile': return 'Điện thoại, thiết bị thông minh';
      case 'solutions': return 'Giải pháp CNTT';
      default: return 'Tất cả sản phẩm';
    }
  };

  const parseSpecifications = (specsString?: string | null) => {
    if (!specsString) return null;
    try {
      return JSON.parse(specsString);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-12">
      <div className="max-w-screen-2xl mx-auto">
        
        <div className="mb-10 text-center md:text-left border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-extrabold text-[#16223f] uppercase">{getCategoryTitle()}</h1>
          <p className="text-gray-500 mt-2">Hiển thị {filteredProducts.length} sản phẩm phù hợp</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f26522]"></div></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800">Không tìm thấy sản phẩm nào</h3>
            <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const specsObj = parseSpecifications(product.specifications);
              const specKeys = specsObj ? Object.keys(specsObj).slice(0, 3) : [];

              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300">
                  <div className="relative h-56 p-4 flex items-center justify-center bg-white border-b border-gray-50">
                    <img src={product.image_url} alt={product.product_name} className="max-h-full object-contain" />
                    <span className="absolute top-3 left-3 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {product.manufacturer}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-md font-bold text-gray-900 mb-3 line-clamp-2 h-12">{product.product_name}</h3>
                    
                    {specKeys.length > 0 ? (
                      <div className="mb-4 space-y-1">
                        {specKeys.map(key => (
                          <div key={key} className="text-[11px] text-gray-600 flex justify-between border-b border-gray-50 pb-0.5">
                            <span className="font-semibold text-gray-400">{key}:</span>
                            <span className="text-gray-800 truncate pl-2">{specsObj[key]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs mb-4 flex-1 line-clamp-3">{product.description}</p>
                    )}
                    
                    <Link 
                      to={`/product/${product.id}`} 
                      className="w-full text-center bg-[#f26522] hover:bg-[#d9531e] text-white font-bold py-2.5 rounded-lg transition-colors mt-auto"
                    >
                      Chi tiết sản phẩm
                    </Link>
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