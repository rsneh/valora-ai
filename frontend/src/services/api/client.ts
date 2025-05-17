import axios, { AxiosError, AxiosResponse, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { FastAPIErrorResponse, FormattedErrors, handleFastAPIError } from './errorHandler';

export interface CustomApiError extends Error {
  originalError?: AxiosError<FastAPIErrorResponse | any>;
  response?: AxiosResponse;
  formattedErrors: FormattedErrors;
  status?: number;
  isAxiosError: boolean | undefined;
}

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

// Add a response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    // Simply return the response if it's successful
    return response;
  },
  (error: AxiosError<FastAPIErrorResponse | any>) => {
    // Any status codes that fall outside the range of 2xx cause this function to trigger

    let processedFormattedErrors: FormattedErrors;
    let errorMessage = 'An error occurred.';
    const errorStatus: number | undefined = error.response?.status;

    if (error.response && error.response.data) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx.
      // error.response.data is likely the FastAPI error payload.
      processedFormattedErrors = handleFastAPIError(error.response.data);
      errorMessage = processedFormattedErrors.generic || error.message; // Prioritize generic message from FastAPI
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      processedFormattedErrors = handleFastAPIError(new Error('Network error: No response received from server.'));
      errorMessage = processedFormattedErrors.generic || 'Network error.';
    } else {
      // Something happened in setting up the request that triggered an Error
      processedFormattedErrors = handleFastAPIError(error); // Pass the original error object
      errorMessage = processedFormattedErrors.generic || error.message;
    }

    // Create a new custom error object to be rejected
    // This allows components to consistently access `formattedErrors`
    const customError: CustomApiError = {
      name: 'CustomApiError',
      message: errorMessage,
      originalError: error,
      response: error.response,
      formattedErrors: processedFormattedErrors,
      status: errorStatus,
      isAxiosError: error.isAxiosError,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
