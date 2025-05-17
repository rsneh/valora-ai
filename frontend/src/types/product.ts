export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  seller_id: string;
  time_created: string;
  time_updated?: string;
}

export interface ProductFormData {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  image_key?: string;
  location_text?: string;
}

export interface Category {
  value: string;
  title: string;
  description?: string;
  icon?: string;
  show?: boolean;
  menu?: string;
}