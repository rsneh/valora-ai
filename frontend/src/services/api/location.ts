import { AxiosRequestConfig } from 'axios';
import apiClient from './client';

export const getLocation = async (
  lat: number,
  lng: number,
  token: string,
  options: AxiosRequestConfig = {},
): Promise<Location> => {
  const response = await apiClient.get<Location>(`/location/?lat=${lat}&lng=${lng}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });
  return response.data;
};