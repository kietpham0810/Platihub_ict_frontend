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

export interface BotReport {
  total_links_found?: number;
  total_links?: number;
  new_inserted?: number;
  updated_specifications?: number;
  has_more?: boolean;
  next_offset?: number;
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

// Danh mục sản phẩm dùng chung cho form admin, đồng bộ với bộ lọc ở trang sản phẩm
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
];

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

export interface BotContinueDialogState {
  isOpen: boolean;
  nextOffset: number;
  url: string;
  summary: string;
}
