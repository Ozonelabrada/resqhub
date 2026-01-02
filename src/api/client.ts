import axios from 'axios';
import { authManager } from '../utils/sessionManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:7003' || 'https://resqhub-be.onrender.com',
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
      
      // Redirect to login page if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && 
          !currentPath.includes('/signin') && 
          !currentPath.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;