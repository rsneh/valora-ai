"use server"

import { unstable_cache } from 'next/cache';
import apiClient from './client';
import { type Category } from '@/types/category';

export const getCategories = unstable_cache(
  async (locale: string, parentKey?: string): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(`/categories/`, {
      "params": { locale, parentKey },
    });
    return response.data;
  },
  ['top-categories'],
  {
    revalidate: 3600,
    tags: ['categories']
  }
);

export const getCategoriesBySlug = unstable_cache(
  async (locale: string, categorySlug: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${categorySlug}`, {
      "params": { locale },
    });
    return response.data;
  },
  ['category-by-slug'],
  {
    revalidate: 3600,
    tags: ['categories']
  }
);

export const getCategoryBreadcrumbs = async (locale: string, categoryId: string): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(`/categories/${categoryId}/breadcrumbs`, {
    "params": { locale },
  });
  return response.data;
};