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