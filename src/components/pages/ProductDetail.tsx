import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Đã sửa lại thành lùi 2 cấp thư mục (../../)
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
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCT_DETAIL)}?id=${id}`);
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          setProduct(data.data);
        } else {
          setError(data.message || 'Sản phẩm không tồn tại.');
        }
      } catch (err) {
        setError('Lỗi kết nối đến máy chủ.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f26522]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Opps! Cụt đường rồi...</h2>
        <p className="text-gray-600 mb-6">{error || 'Không tìm thấy sản phẩm này.'}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#f26522] text-white font-bold rounded shadow hover:bg-[#d9531e]">
          Quay lại trang trước
        </button>
      </div>
    );
  }

  let parsedSpecs: Record<string, string> = {};
  if (product.specifications) {
    try {
      parsedSpecs = typeof product.specifications === 'string' 
        ? JSON.parse(product.specifications) 
        : product.specifications;
    } catch (e) {
      console.error("Lỗi giải mã specifications", e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#f26522] transition-colors">Trang chủ</Link>
          <span className="mx-2">›</span>
          <span className="hover:text-[#f26522] transition-colors cursor-pointer">{product.product_type}</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium truncate inline-block align-bottom max-w-[200px] sm:max-w-md">
            {product.product_name}
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-5/12 p-8 border-r border-gray-100 flex items-center justify-center bg-white">
            <img 
              src={product.image_url} 
              alt={product.product_name} 
              className="w-full h-auto max-h-[400px] object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="md:w-7/12 p-8 flex flex-col">
            <div className="uppercase tracking-wider text-xs font-bold text-gray-400 mb-2">
              Thương hiệu: <span className="text-[#f26522]">{product.manufacturer}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {product.product_name}
            </h1>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 border-l-4 border-l-[#f26522]">
              <span className="text-gray-600 text-sm block mb-1">GIÁ (Gồm VAT):</span>
              {product.is_price_visible === 1 && product.price ? (
                <span className="text-3xl font-extrabold text-[#f26522]">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </span>
              ) : (
                <span className="text-2xl font-extrabold text-[#f26522]">LIÊN HỆ</span>
              )}
            </div>

            <div className="text-gray-600 mb-8 flex-grow leading-relaxed">
              {product.description}
            </div>

            <div className="flex gap-4 mt-auto">
              <button className="flex-1 bg-[#f26522] hover:bg-[#d9531e] text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2">
                <span>🛒</span> THÊM VÀO GIỎ HÀNG
              </button>
              <button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                <span>📞</span> GỌI TƯ VẤN
              </button>
            </div>
          </div>
        </div>

        {Object.keys(parsedSpecs).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Thông số kỹ thuật chi tiết</h2>
            </div>
            
            <div className="p-0">
              <table className="w-full text-sm md:text-base text-left">
                <tbody>
                  {Object.entries(parsedSpecs).map(([key, value], index) => (
                    <tr key={index} className={`border-b border-gray-100 hover:bg-orange-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-8 font-semibold text-gray-700 w-1/3 md:w-1/4 align-top border-r border-gray-100">
                        {key}
                      </td>
                      <td className="py-4 px-8 text-gray-600 leading-relaxed">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}