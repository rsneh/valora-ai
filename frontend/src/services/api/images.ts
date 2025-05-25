import { AxiosRequestConfig } from 'axios';
import apiClient from './client';
import { type Image } from '@/types/image';
import { ImageItem } from '@/types/product';

export const uploadImage = async (
  formData: FormData,
  token: string,
  options: AxiosRequestConfig = {},
): Promise<Image> => {
  const response = await apiClient.post<Image>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });
  return response.data;
};

export const uploadProductImages = async (
  productId: number,
  images: ImageItem[],
  token: string,
  options: AxiosRequestConfig = {},
): Promise<Image> => {
  const formData = new FormData();
  images.forEach((image) => {
    if (image.file) {
      formData.append(`images`, image.file);
    }
  });
  const response = await apiClient.post<Image>(`/images/product/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });
  return response.data;
};

