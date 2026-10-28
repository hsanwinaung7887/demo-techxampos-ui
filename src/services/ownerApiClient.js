import axios from 'axios';
import { getApiBaseUrl } from '../components/utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();


const ownerApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ✅ Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refresh
ownerApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => ownerApiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await ownerApiClient.post('/owner/auth/refresh');
        
        if (response.data?.success) {
          processQueue(null);
          return ownerApiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear persisted state on refresh failure
        localStorage.removeItem('persist:root');
        window.location.href = '/ownerLogin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default ownerApiClient;