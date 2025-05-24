import apiClient from './client';
import { type ProductFormData, type Product } from '@/types/product';

export const getProducts = async (token?: string, params?: Record<string, string | number | boolean | undefined>): Promise<Product[]> => {
  let queryString = '';
  if (params) {
    const queryParts = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

    if (queryParts.length > 0) {
      queryString = `?${queryParts.join('&')}`;
    }
  }
  const response = await apiClient.get<Product[]>(`/products/${queryString}`, {
    headers: token ? {
      "Authorization": `Bearer ${token}`,
    } : undefined,
  });
  return response.data;
};

export const getCategoryProducts = async (locale: string, category: string): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/products/', {
    params: {
      locale,
      category,
    },
  });
  console.log('Category Products:', response.data);
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

export const updateProduct = async (productId: string, formData: ProductFormData, token: string): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${productId}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};