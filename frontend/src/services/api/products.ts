import apiClient from './client';
import { type ProductFormData, type Product } from '@/types/product';

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/products/');
  return response.data;
};

export const getProductById = async (productId: string | number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${productId}`);
  return response.data;
};


export const createProduct = async (formData: ProductFormData, token: string): Promise<Product> => { // Renamed to avoid conflict
  const response = await apiClient.post<Product>('/products/', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};