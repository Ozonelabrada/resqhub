/**
 * Type definitions for global window object extensions
 * Ensures type safety when accessing custom properties on window
 */

import { safeStopPropagation, extractSyntheticEvent } from './events';

export interface ToastFunction {
  (type: 'success' | 'error' | 'info' | 'warn', title: string, message?: string): void;
}

export interface WindowWithCustom extends Window {
  showToast?: ToastFunction;
  __RESQHUB_DEBUG__?: boolean;
  __RESQHUB_CONFIG__?: {
    apiBase?: string;
    environment?: 'development' | 'staging' | 'production';
  };
}

/**
 * Safely access custom window properties with type checking
 */
export const getWindowExt = (): WindowWithCustom => {
  return typeof window !== 'undefined' ? (window as WindowWithCustom) : ({} as WindowWithCustom);
};

/**
 * Safe toast notification function
 */
export const showToast = (type: 'success' | 'error' | 'info' | 'warn', title: string, message?: string): void => {
  const w = getWindowExt();
  if (typeof w.showToast === 'function') {
    w.showToast(type, title, message);
  }
};

// Re-export event helpers for convenience
export { safeStopPropagation, extractSyntheticEvent };
