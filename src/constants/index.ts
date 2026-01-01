/**
 * Application-wide constants
 *
 * This file contains all shared constants used across the application.
 * Centralizing constants here ensures consistency and makes maintenance easier.
 */

// UI Constants
export const UI_CONSTANTS = {
  DESKTOP_BREAKPOINT: 1024, // px - Minimum width for desktop layout
  MOBILE_BREAKPOINT: 768, // px - Maximum width for mobile layout
  TABLET_BREAKPOINT: 1024, // px - Breakpoint between tablet and desktop
} as const;

// API Constants
export const API_CONSTANTS = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds - Auto-refresh interval for data
  DEFAULT_TOAST_LIFE: 5000, // 5 seconds - Default duration for toast notifications
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PUBLIC_USER_TOKEN: 'publicUserToken', // JWT token for public user authentication
  PUBLIC_USER_DATA: 'publicUserData', // User data for public user session
  INTENDED_ACTION: 'intendedAction', // Action user was trying to perform before login
  RETURN_PATH: 'returnPath', // Path to redirect to after login
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  STATS_ERROR: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'Failed to load platform statistics. Using default values.',
    life: 5000,
  },
  TRENDING_ERROR: {
    severity: 'warn' as const,
    summary: 'Warning',
    detail: 'Failed to load trending reports. Using default data.',
    life: 5000,
  },
} as const;

// Menu Items Factory Functions
// These functions create menu items with proper navigation commands
export const createAccountMenuItems = (navigate: (path: string) => void, handleLogout: () => void) => [
  { label: 'My Profile', icon: 'pi pi-user', command: () => navigate(ROUTES.PROFILE) },
  { label: 'Personal Hub', icon: 'pi pi-home', command: () => navigate(ROUTES.HUB) },
  { label: 'My Reports', icon: 'pi pi-list', command: () => navigate(`${ROUTES.HUB}?tab=reports`) },
  { label: 'Notifications', icon: 'pi pi-bell', command: () => navigate(ROUTES.NOTIFICATIONS) },
  { label: 'Settings', icon: 'pi pi-cog', command: () => navigate(ROUTES.SETTINGS) },
  { separator: true },
  { label: 'Admin Panel', icon: 'pi pi-shield', command: () => navigate(ROUTES.ADMIN_LOGIN), className: 'text-orange-600' },
  { separator: true },
  { label: 'Help & Support', icon: 'pi pi-question-circle', command: () => navigate(ROUTES.HELP) },
  { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout, className: 'text-red-600' }
];

export const createGuestMenuItems = (navigate: (path: string) => void) => [
  { label: 'Sign In', icon: 'pi pi-user', command: () => navigate(ROUTES.LOGIN) },
  { label: 'Admin Login', icon: 'pi pi-shield', command: () => navigate(ROUTES.ADMIN_LOGIN) }
];

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  PROFILE: '/profile',
  HUB: '/hub',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  HELP: '/help',
  SEARCH: '/search',
  REPORT: '/report',
} as const;

// Report Types
export const REPORT_TYPES = {
  LOST: 'lost',
  FOUND: 'found',
} as const;