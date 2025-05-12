import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.headers.Authorization) {
      return config;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
