/**
 * API Configuration
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || '/api/v1';

/**
 * App Configuration
 */
export const APP_NAME = 'FindrHub';
export const APP_VERSION = '1.0.0';
export const APP_PACKAGE = 'com.findrhub.app';

/**
 * Feature Flags
 */
export const FEATURES = {
  NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  GEOLOCATION: process.env.EXPO_PUBLIC_ENABLE_GEOLOCATION === 'true',
};

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PREFERENCES: 'preferences',
  DRAFTS: 'drafts',
};

/**
 * Default Values
 */
export const DEFAULTS = {
  PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_IMAGES: 5,
};

/**
 * Report Status
 */
export const REPORT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

/**
 * Report Type
 */
export const REPORT_TYPE = {
  LOST: 'lost',
  FOUND: 'found',
} as const;

/**
 * Theme Colors
 */
export const THEME = {
  PRIMARY: '#14b8a6', // teal-600
  ACCENT: '#059669', // emerald-600
  SUCCESS: '#22c55e', // green-500
  ERROR: '#ef4444', // red-500
  WARNING: '#eab308', // yellow-500
  INFO: '#3b82f6', // blue-500
  BACKGROUND: '#ffffff',
  TEXT_PRIMARY: '#1f2937',
  TEXT_SECONDARY: '#6b7280',
  BORDER: '#e5e7eb',
};

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',

  // Reports
  REPORTS: '/reports',
  REPORT_DETAIL: (id: string) => `/reports/${id}`,
  REPORT_CREATE: '/reports',
  REPORT_UPDATE: (id: string) => `/reports/${id}`,
  REPORT_DELETE: (id: string) => `/reports/${id}`,

  // Search
  SEARCH: '/reports/search',
  TRENDING: '/reports/trending',

  // User
  PROFILE: '/users/profile',
  PROFILE_UPDATE: '/users/profile',
  USER_REPORTS: '/users/reports',
  USER_NOTIFICATIONS: '/users/notifications',
} as const;
