import { cache } from 'react';
import apiClient from './client';
import { type Category } from '@/types/category';

export const getCategories = cache(async (parentKey?: string, locale?: string): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(`/categories/${parentKey ? `?key=${parentKey}` : ''}`);
  return response.data;
});

export const getCategoriesBySlug = async (categorySlug: string): Promise<Category> => {
  const response = await apiClient.get<Category>(`/categories/${categorySlug}`);
  return response.data;
};

export const getCategoryBreadcrumbs = async (categoryKey: string): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(`/categories/${categoryKey}/breadcrumbs`);
  return response.data;
};