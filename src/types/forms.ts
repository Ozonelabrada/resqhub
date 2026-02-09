/**
 * Type definitions for form data and validation
 * Ensures type safety across form submissions and updates
 */

export interface ReportFormData {
  categoryId: string;
  title: string;
  description: string;
  location: string;
  reportType: 'lost' | 'found' | 'news' | 'discussion' | 'announcement';
  rewardAmount: number;
  rewardDetails: string;
  contactInfo: string;
  images?: File[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends SignInFormData {
  fullName: string;
  username: string;
  confirmPassword: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
}

/**
 * Form state tracker for error handling
 */
export interface FormErrors {
  [key: string]: string | string[];
}

/**
 * API response wrapper types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: FormErrors;
}

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: FormErrors;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};
