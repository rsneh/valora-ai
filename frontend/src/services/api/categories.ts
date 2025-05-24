import { cache } from 'react';
import apiClient from './client';
import { type Category } from '@/types/category';

export const getCategories = cache(async (locale: string, parentKey?: string): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(`/categories/`, {
    "params": { locale, parentKey },
  });
  return response.data;
});

export const getCategoriesBySlug = async (locale: string, categorySlug: string): Promise<Category> => {
  const response = await apiClient.get<Category>(`/categories/${categorySlug}`, {
    "params": { locale },
  });
  return response.data;
};

export const getCategoryBreadcrumbs = async (locale: string, categoryId: string): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(`/categories/${categoryId}/breadcrumbs`, {
    "params": { locale },
  });
  return response.data;
};