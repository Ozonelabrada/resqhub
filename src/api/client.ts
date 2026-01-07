import axios from 'axios';
import { authManager } from '../utils/sessionManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com',
  timeout: Number(import.meta.env.VITE_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Get token from auth manager
  const token = authManager.getToken();

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Response interceptor to handle token expiration and unauthorized access
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid or expired - logout user
      console.warn('Authentication error - logging out user');
      authManager.logout();
      
      if ((window as any).showToast) {
        // Use 'warn' severity for 401 errors as requested (orange toast)
        (window as any).showToast('warn', 'Session Expired', 'Please log in again.');
      }
    } else if (error.response) {
      // Other API errors
      if ((window as any).showToast) {
        (window as any).showToast('error', 'API Error', error.response.data?.message || 'Something went wrong.');
      }
    } else if (error.request) {
      // Network errors
      if ((window as any).showToast) {
        (window as any).showToast('error', 'Network Error', 'Please check your internet connection.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;