// src/constants/config.ts

// ==========================================
// 1. CẤU HÌNH THÔNG TIN SITE (UI CONSTANTS)
// ==========================================

// Vẫn giữ biến cũ để không làm lỗi các component hiện tại (Intro, About)
export const ADMIN_PHONE = "+84918227719";

// Cấu hình cho trang Liên Hệ (Admin Config)
export const SITE_CONFIG = {
  address: "159C De Tham Street, Cau Ong Lanh Ward, Ho Chi Minh City, Vietnam",
  emails: [
    "software@platihub.com",
    "ict@platihub.com"
  ],
  phones: [
    "+84918227719"
  ],
  workingHours: "Thứ 2 đến Thứ 6, 08:00 AM - 05:30 PM",
} as const;

// ==========================================
// 1b. DANH MỤC SẢN PHẨM (NGUỒN DUY NHẤT)
// ==========================================
// Dùng chung cho: form admin, bộ lọc trang sản phẩm, danh sách chờ duyệt.
// Trước đây danh sách này bị lặp lại ở 3 nơi với casing lệch nhau
// (vd "MainBoard" vs "Mainboard", "Tản nhiệt" vs "Tản Nhiệt") khiến lọc
// theo category bị sai. Mọi nơi cần danh mục PHẢI import từ đây.
export const PRODUCT_CATEGORY_OPTIONS: { label: string; value: string }[] = [
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
];

// ==========================================
// 2. CẤU HÌNH HỆ THỐNG API (API CONSTANTS)
// ==========================================

/**
 * Lấy API Base URL từ biến môi trường.
 * Có cơ chế Fallback để phòng ngừa lỗi mất file .env khi deploy lên Hosting.
 */
const getApiBaseUrl = (): string => {
    try {
        const url = import.meta.env.VITE_API_BASE_URL;
        if (!url || typeof url !== 'string') {
            console.warn("⚠️ VITE_API_BASE_URL is missing or invalid. Falling back to relative path '/api'.");
            return '/api'; 
        }
        return url;
    } catch (error) {
        console.error("🚨 Lỗi truy xuất biến môi trường:", error);
        return '/api';
    }
};

export const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    TIMEOUT: Number(import.meta.env.VITE_TIMEOUT_MS) || 5000,
    ENDPOINTS: {
        GET_PRODUCTS: '/get_products.php',
        GET_PRODUCT_DETAIL: '/get_product_detail.php',
        ADD_PRODUCT: '/add_product.php',
        UPDATE_PRODUCT: '/update_product.php',
        DELETE_PRODUCT: '/delete_product.php',
        APPROVE_PRODUCT: '/approve_product.php',
        HIDE_PRODUCT: '/hide_product.php',
        GET_CONFIGS: '/get_configs.php',
        CRAWL_FILTERED: '/crawl_filtered.php',
        ADMIN_LOGIN: '/admin_login.php'
    }
} as const;

/**
 * Hàm Helper tạo Full URL chuẩn xác.
 * Tự động xử lý triệt để lỗi double slash (//) nếu BASE_URL hoặc ENDPOINT bị dư dấu '/'.
 */
// ==========================================
// 3. ĐĂNG NHẬP ADMIN (XÁC THỰC Ở BACKEND)
// ==========================================
// Username/password được kiểm tra ở backend (api/admin_login.php), không
// còn nằm trong bundle JS. Sau khi đăng nhập thành công, backend trả về 1
// token có hạn (12h) - lưu token này ở sessionStorage và gửi kèm header
// Authorization: Bearer <token> ở mọi request ghi/xóa dữ liệu.
export const ADMIN_SESSION_KEY = 'platihub_admin_token';

export const getAdminToken = (): string | null => sessionStorage.getItem(ADMIN_SESSION_KEY);

export const clearAdminToken = (): void => sessionStorage.removeItem(ADMIN_SESSION_KEY);

export const adminAuthHeaders = (): Record<string, string> => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const buildApiUrl = (endpoint: string): string => {
    if (!endpoint) return API_CONFIG.BASE_URL;
    
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, ''); // Xóa slash ở cuối
    const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Xóa slash ở đầu
    
    return `${baseUrl}/${cleanEndpoint}`;
};