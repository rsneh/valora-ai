import apiClient from './client';
import { type ProductFormData, type Product, ContactFormData } from '@/types/product';

type QueryParams = Record<string, string | number | boolean | undefined>;

export const getProducts = async (token?: string, params?: QueryParams): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(`/products/`, {
    params,
    headers: token ? {
      "Authorization": `Bearer ${token}`,
    } : undefined,
  });
  return response.data;

};

export const getCategoryProducts = async (locale: string, category: string, params?: QueryParams): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(`/products/`, {
    params: {
      ...params,
      locale,
      category,
    },
  });
  return response.data;
};

export const getProductById = async (productId: string | number, token?: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get<Product>(`/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: Error | any) {
    console.error(`Error fetching product ${productId}:`, error.message);
    return null;
  }
};

export const createProduct = async (formData: ProductFormData, token: string): Promise<Product> => { // Renamed to avoid conflict
  const response = await apiClient.post<Product>('/products/', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateProduct = async (productId: string, formData: ProductFormData | ContactFormData, token: string): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${productId}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteProduct = async (productId: string, token: string): Promise<Product> => {
  const response = await apiClient.delete(`/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};