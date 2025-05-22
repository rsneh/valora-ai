export const productConditionEnum = [
  "NEW",
  "LIKE_NEW",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
] as const;

export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  condition?: typeof productConditionEnum;
  currency?: string;
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
  id?: number;
  title?: string;
  description?: string;
  price: number;
  condition?: typeof productConditionEnum[number];
  category: string;
  currency?: string;
  image_url?: string;
  image_key?: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  location_source?: string;
  min_acceptable_price?: number;
  negotiation_notes_for_ai?: string;
}
