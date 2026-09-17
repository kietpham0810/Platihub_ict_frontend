export interface Product {
  id: string;
  product_name: string;
  image_url: string;
  description: string;
  manufacturer: string;
  product_type: string;
  price?: number | null;
  is_price_visible?: number;
  specifications?: string | Record<string, string> | null;
  created_at?: string;
}

export interface SpecField {
  key: string;
  value: string;
}

export interface ProductFormData {
  product_name: string;
  manufacturer: string;
  product_type: string;
  image_url: string;
  description: string;
}

export const EMPTY_FORM_DATA: ProductFormData = {
  product_name: '',
  manufacturer: '',
  product_type: '',
  image_url: '',
  description: '',
};

// Danh mục sản phẩm: nguồn duy nhất nằm ở constants/config.ts, re-export
// tại đây để không phá vỡ các import cũ trỏ tới './types'.
export { PRODUCT_CATEGORY_OPTIONS } from '../../constants/config';

export type ConfirmType = 'approve' | 'delete' | 'hide';

export interface ConfirmDialogState {
  isOpen: boolean;
  type: ConfirmType | null;
}

export interface ResultDialogState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

// Cây danh mục cào theo bộ lọc (Danh mục lớn -> Nhóm -> Hãng -> Dòng con),
// lấy từ configs.crawl_category_tree (xem cli/seed_crawl_categories.php ở
// repo backend). Mỗi node có thể vừa có url (điểm dừng hợp lệ để cào) vừa có
// children (đi sâu hơn).
export interface CrawlCategoryNode {
  label: string;
  url?: string;
  children?: CrawlCategoryNode[];
}

export type CrawlCategoryTree = Record<string, CrawlCategoryNode>;

export interface FilteredCrawlResult {
  scanned: number;
  new_inserted: number;
  updated_specifications: number;
  excluded: number;
  filtered_out: number;
  total_links_in_category: number;
  reached_target: boolean;
}
