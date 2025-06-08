import { Category } from "./category";

export const productConditionEnum = [
  "NEW",
  "LIKE_NEW",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
] as const;

export type ImageItem = {
  src: string;
  file?: File;
}

export type ImageGallery = {
  id: number;
  product_id: number;
  image_url: string;
}

export interface Product {
  id: number;
  title: string;
  category_id: number;
  description?: string;
  price: number;
  condition?: typeof productConditionEnum[number];
  currency?: string;
  image_url?: string;
  // seller_id: string;
  time_created: string;
  time_updated?: string;
  location_text: string;
  min_acceptable_price?: number;
  negotiation_notes_for_ai?: string;
  category?: Category;
  attributes?: Record<string, string>;
  images?: ImageGallery[];
  distance_km?: number;
  latitude?: number;
  longitude?: number;
}

export interface ProductFormData {
  id?: number;
  title?: string;
  description?: string;
  price: number;
  condition?: typeof productConditionEnum[number];
  category_id?: number;
  currency?: string;
  image_url?: string;
  image_key?: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  location_source?: string;
  min_acceptable_price?: number;
  // negotiation_notes_for_ai?: string;
  attributes?: Record<string, string>;
  images?: ImageItem[];
  seller_name?: string;
  seller_phone?: string;
}

export interface ContactFormData {
  email?: string;
  product_id?: number;
  location_text?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_allowed_to_contact?: boolean;
  // negotiation_notes_for_ai?: string;
}
