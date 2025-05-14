import { AxiosRequestConfig } from 'axios';
import apiClient from './client';
import { type Image } from '@/types/image';

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