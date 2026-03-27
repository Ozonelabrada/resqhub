/**
 * Application Constants
 * API endpoints and app configuration
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  REPORTS: {
    LIST: '/reports',
    CREATE: '/reports',
    GET: (id: string) => `/reports/${id}`,
    UPDATE: (id: string) => `/reports/${id}`,
    DELETE: (id: string) => `/reports/${id}`,
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
};

// App Configuration
export const APP_CONFIG = {
  API_TIMEOUT: 30000,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
};
