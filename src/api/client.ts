import axios from 'axios';
import { authManager } from '../utils/sessionManager';
import { serverHealth } from './serverHealth';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com',
  timeout: Number(import.meta.env.VITE_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Circuit breaker: Prevent requests if server is down
  if (serverHealth.isServerDown()) {
    return Promise.reject(new Error('SERVER_UNREACHABLE'));
  }

  // Get token from auth manager
  const token = authManager.getToken();

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Explicitly handle Content-Type for FormData vs JSON
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (config.data) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Response interceptor to handle token expiration and unauthorized access
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - logout user
      console.warn('Session expired - logging out');
      authManager.logout();
      
      if ((window as any).showToast) {
        (window as any).showToast('warn', 'Session Expired', 'Please log in again.');
      }
    } else if (error.response?.status === 403) {
      // Forbidden - current user doesn't have permission for this specific endpoint
      console.error('Permission denied (403)');
      if ((window as any).showToast) {
        (window as any).showToast('error', 'Access Denied', 'You do not have permission to perform this action.');
      }
    } else if (error.response) {
      // Other API errors
      if ((window as any).showToast) {
        (window as any).showToast('error', 'API Error', error.response.data?.message || 'Something went wrong.');
      }
    } else if (error.request || error.message === 'SERVER_UNREACHABLE') {
      // Network errors or circuit breaker triggered
      serverHealth.reportNetworkError();
      // No toast here as the top notification banner in App.tsx handles this
    }
    return Promise.reject(error);
  }
);

export default api;