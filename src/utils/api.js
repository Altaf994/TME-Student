import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:3000/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const tokenKey = process.env.REACT_APP_AUTH_TOKEN_KEY || 'access_token';
    const token = localStorage.getItem(tokenKey);
    console.log('[apiService] Token Key:', tokenKey);
    console.log('[apiService] Access Token:', token);
    // Only set Authorization if not explicitly disabled
    if (
      token &&
      (typeof config.headers.Authorization === 'undefined' ||
        config.headers.Authorization === null ||
        config.headers.Authorization === '')
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(
          process.env.REACT_APP_REFRESH_TOKEN_KEY
        );
        if (refreshToken) {
          const response = await axios.post('/auth/refresh', {
            refreshToken,
          });
          const { accessToken } = response.data;

          localStorage.setItem(
            process.env.REACT_APP_AUTH_TOKEN_KEY,
            accessToken
          );
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem(process.env.REACT_APP_AUTH_TOKEN_KEY);
        localStorage.removeItem(process.env.REACT_APP_REFRESH_TOKEN_KEY);
        // window.location.href = '/login';
      }
    }

    // Handle other errors
    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

export default api;
