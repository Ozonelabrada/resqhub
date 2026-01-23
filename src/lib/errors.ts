/**
 * Error handling types for secure API communication
 * Provides type-safe error tracking and user-facing messages
 */

export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: ErrorCode;
  errors?: Record<string, string | string[]>;
  statusCode?: number;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string | string[]>;
}

/**
 * Parse error response from API
 */
export const parseErrorResponse = (error: unknown): ApiErrorResponse => {
  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') {
      return {
        success: false,
        message: errorObj.message,
        code: (errorObj.code as ErrorCode) || 'UNKNOWN_ERROR',
        errors: typeof errorObj.errors === 'object' ? errorObj.errors as Record<string, string | string[]> : undefined,
        statusCode: typeof errorObj.statusCode === 'number' ? errorObj.statusCode : 500
      };
    }
  }

  return {
    success: false,
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

/**
 * User-friendly error message mapper
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
  }

  return defaultMessage;
};

/**
 * Check if error is a specific type
 */
export const isErrorType = (error: unknown, code: ErrorCode): boolean => {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    return errorObj.code === code;
  }
  return false;
};
