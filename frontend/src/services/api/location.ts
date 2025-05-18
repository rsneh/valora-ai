import { AxiosRequestConfig } from 'axios';
import apiClient from './client';
import { Location, LocationSuggestion } from '@/types/location';

export const getLocation = async (
  token: string,
  lat?: number,
  lng?: number,
  options: AxiosRequestConfig = {},
): Promise<Location> => {
  const response = await apiClient.get<Location>(`/location/?${lat ? `lat=${lat}` : ""}${lng ? `&lng=${lng}` : ""}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });
  return response.data;
};

export const queryLocation = async (
  token: string,
  query: string,
  options: AxiosRequestConfig = {},
): Promise<LocationSuggestion[]> => {
  const response = await apiClient.get<LocationSuggestion[]>(`/location/suggest?q=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });
  return response.data;
};