// src/lib/axiosInstance.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError, type InternalAxiosRequestConfig, type AxiosResponse, AxiosHeaders } from 'axios'; // Import AxiosHeaders
import { store } from '../store';
import { logout, setTokens } from '../features/auth/authSlice';
import type { AuthTokensResponse, UserClaims } from '../features/auth/authSlice';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(instance(prom.config));
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attaches the access token to outgoing requests
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      // FIX: Safely initialize config.headers if it's missing.
      // Axios typically ensures it's present, but if not, create a new AxiosHeaders instance.
      // This is a more robust way to handle potentially undefined 'headers' directly.
      if (!(config.headers instanceof AxiosHeaders)) { // Check if it's not already an AxiosHeaders instance
        config.headers = new AxiosHeaders(config.headers); // Convert existing headers or create new
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles token refresh on 401 Unauthorized errors
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } = error.config! as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse: AxiosResponse<AuthTokensResponse> = await axios.post(
            `${API_BASE_URL}/Account/Refresh`,
            {
              expiredAccessToken: state.auth.token,
              refreshToken: refreshToken,
            },
            { withCredentials: true }
          );

          store.dispatch(setTokens(refreshResponse.data));

          // FIX: Safely initialize originalRequest.headers if it's missing, similar to request interceptor.
          if (!(originalRequest.headers instanceof AxiosHeaders)) {
            originalRequest.headers = new AxiosHeaders(originalRequest.headers);
          }
          originalRequest.headers.set('Authorization', `Bearer ${refreshResponse.data.accessToken}`);
          processQueue(null, refreshResponse.data.accessToken);

          return instance(originalRequest);
        } catch (refreshError: any) {
          store.dispatch(logout());
          processQueue(refreshError, null);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).then((res) => {
          return res;
        }).catch((err) => {
          return Promise.reject(err);
        });
      }
    }

    return Promise.reject(error);
  }
);

export const axiosInstance = <T = any>(
  config: AxiosRequestConfig,
): Promise<T> => {
  return instance(config).then((response: AxiosResponse<T>) => response.data);
};

export default instance;