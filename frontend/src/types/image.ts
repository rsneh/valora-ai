import { productConditionEnum } from "./product";

export interface Image {
  image_key: string;
  image_url: string;
  suggested_title?: string;
  suggested_attributes: Record<string, string>;
  suggested_category_key?: string;
  suggested_description?: string;
  suggested_condition?: typeof productConditionEnum[number];
}