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
  location_text: string;
  min_acceptable_price?: number;
  negotiation_notes_for_ai?: string;
}

export interface ProductFormData {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  image_key?: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  location_source?: string;
}

export interface Category {
  value: string;
  title: string;
  description?: string;
  icon?: string;
  show?: boolean;
  menu?: string;
  imagePath?: string;
}