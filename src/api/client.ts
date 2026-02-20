import axios from 'axios';
import { authManager } from '../utils/sessionManager';
import { serverHealth } from './serverHealth';
import { getWindowExt } from '../types/window';

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
    return Promise.reject(new Error('SERVER UNREACHABLE'));
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
      // Token is invalid or expired - only notify if a user session existed
      if (authManager.isAuthenticated()) {
        console.warn('Session expired - logging out');
        authManager.logout();

        const toast = getWindowExt()?.showToast;
        if (toast) {
          toast('warn', 'Session Expired', 'Please log in again.');
        }
      } else {
        // No active session on client — silently clear any stale token without showing a toast
        authManager.logout();
        console.debug('Received 401 but user was not authenticated; suppressing session-expired toast');
      }
    } else if (error.response?.status === 403) {
      // Forbidden - current user doesn't have permission for this specific endpoint
      console.error('Permission denied (403)');
      const toast = getWindowExt()?.showToast;
      if (toast) {
        toast('error', 'Access Denied', 'You do not have permission to perform this action.');
      }
    } else if (error.response?.status === 404) {
      // Not found - silently ignore for GET requests, show error for others
      console.warn('Resource not found (404):', error.config?.url);
      // Don't show error notification for 404s on GET requests (normal to have no data)
      // If you need to show error for specific POST/PUT 404s, add logic here
    } else if (error.response?.status === 409) {
      // Conflict - this is a warning, not necessarily an error
      console.warn('Conflict (409):', error.config?.url, error.response.data);
      const toast = getWindowExt()?.showToast;
      if (toast) {
        console.log('Showing warn toast for 409 conflict');
        toast('warn', 'Conflict', error.response.data?.message || 'This resource already exists or conflicts with existing data.');
      }
    } else if (error.response?.data?.message?.toLowerCase().includes('conflict') || 
               error.response?.data?.message?.toLowerCase().includes('already exists')) {
      // Fallback for conflict-related errors that might not have 409 status
      console.warn('Conflict detected from message:', error.response.data?.message);
      const toast = getWindowExt()?.showToast;
      if (toast) {
        console.log('Showing warn toast for conflict message');
        toast('warn', 'Conflict', error.response.data?.message || 'This resource already exists or conflicts with existing data.');
      }
    } else if (error.response) {
      // Other API errors
      console.warn('API Error - Status:', error.response?.status, 'URL:', error.config?.url);
      const toast = getWindowExt()?.showToast;
      if (toast) {
        toast('error', 'API Error', error.response.data?.message || 'Something went wrong.');
      }
    } else if (error.request || error.message === 'SERVER UNREACHABLE') {
      // Network errors or circuit breaker triggered
      serverHealth.reportNetworkError();
      // No toast here as the top notification banner in App.tsx handles this
    }
    return Promise.reject(error);
  }
);

export default api;