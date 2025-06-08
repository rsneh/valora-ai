export interface Category {
  id: number;
  category_key: string;
  name: string;
  path: string;
  description?: string;
  image_path?: string;
  parent_category_key?: string;
  attribute_schema?: Array<Record<string, any>>;
}