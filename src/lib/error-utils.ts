/**
 * Error Utilities for TanStack Query Integration
 *
 * Provides consistent error handling, formatting, and logging utilities
 * for the Mina Kitchen application.
 */

import { toast } from 'sonner';

/**
 * Standard error response from API
 */
export interface ApiErrorResponse {
  message: string;
  status?: number;
  statusText?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Enhanced error type with additional context
 */
export class AppError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
  isRetryable: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      errors?: Record<string, string[]>;
      isRetryable?: boolean;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.status = options?.status;
    this.code = options?.code;
    this.errors = options?.errors;
    this.isRetryable = options?.isRetryable ?? true;
  }
}

/**
 * Error type categories
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error && typeof error === 'object' && 'name' in error) {
    return error.name === 'NetworkError' || error.name === 'TypeError';
  }
  return false;
}

/**
 * Check if error is an authentication error (401 or 403)
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status === 401 || status === 403;
  }
  return false;
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 422;
  }
  return false;
}

/**
 * Check if error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 404;
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }
  return false;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors are retryable
  if (isNetworkError(error)) return true;

  // Server errors (5xx) are retryable
  if (isServerError(error)) return true;

  // Auth errors are not retryable
  if (isAuthError(error)) return false;

  // Validation errors are not retryable
  if (isValidationError(error)) return false;

  // 404 errors are not retryable
  if (isNotFoundError(error)) return false;

  // Check AppError isRetryable flag
  if (error instanceof AppError) {
    return error.isRetryable;
  }

  // Default: not retryable
  return false;
}

/**
 * Get error category
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  if (isNetworkError(error)) return ErrorCategory.NETWORK;
  if (isAuthError(error)) return ErrorCategory.AUTH;
  if (isValidationError(error)) return ErrorCategory.VALIDATION;
  if (isNotFoundError(error)) return ErrorCategory.NOT_FOUND;
  if (isServerError(error)) return ErrorCategory.SERVER;
  return ErrorCategory.UNKNOWN;
}

/**
 * Extract user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
  // Handle AppError
  if (error instanceof AppError) {
    return error.message;
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default message
  return 'An unexpected error occurred';
}

/**
 * Get detailed error description based on error type
 */
export function getErrorDescription(error: unknown): string {
  const category = getErrorCategory(error);

  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case ErrorCategory.AUTH:
      return 'You need to be logged in to perform this action. Please log in and try again.';
    case ErrorCategory.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorCategory.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorCategory.SERVER:
      return 'Our servers are experiencing issues. Please try again in a moment.';
    default:
      return getErrorMessage(error);
  }
}

/**
 * Format error for display with validation errors
 */
export function formatErrorWithValidation(error: unknown): {
  title: string;
  description: string;
  validationErrors?: Record<string, string[]>;
} {
  const title = getErrorMessage(error);
  const description = getErrorDescription(error);

  // Extract validation errors if present
  let validationErrors: Record<string, string[]> | undefined;
  if (
    error &&
    typeof error === 'object' &&
    'errors' in error &&
    typeof error.errors === 'object'
  ) {
    validationErrors = error.errors as Record<string, string[]>;
  }

  return {
    title,
    description,
    validationErrors,
  };
}

/**
 * Log error to console (and potentially external service)
 */
export function logError(
  error: unknown,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const errorInfo = {
    message: getErrorMessage(error),
    category: getErrorCategory(error),
    isRetryable: isRetryableError(error),
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', errorInfo, error);
  }

  // Error monitoring service integration (e.g., Sentry) can be added here for production
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, {
  //     tags: {
  //       category: errorInfo.category,
  //       component: context?.component,
  //     },
  //     extra: errorInfo,
  //   });
  // }
}

/**
 * Show error toast notification with appropriate styling
 */
export function showErrorToast(
  error: unknown,
  options?: {
    title?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
) {
  const message = options?.title || getErrorMessage(error);
  const description = getErrorDescription(error);
  const category = getErrorCategory(error);

  // Use different toast styles based on error category
  if (category === ErrorCategory.NETWORK) {
    toast.error(message, {
      description: description,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  } else if (category === ErrorCategory.AUTH) {
    toast.error(message, {
      description: description,
      duration: options?.duration || 6000,
      action: options?.action,
    });
  } else if (category === ErrorCategory.VALIDATION) {
    toast.error(message, {
      description: description,
      duration: options?.duration || 4000,
    });
  } else {
    toast.error(message, {
      description: description === message ? undefined : description,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  }

  // Log the error
  logError(error, { action: 'toast_shown' });
}

/**
 * Calculate exponential backoff delay for retries
 */
export function getRetryDelay(attemptIndex: number, baseDelay = 1000): number {
  // Exponential backoff: baseDelay * 2^attemptIndex
  // With jitter to prevent thundering herd
  const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

/**
 * Determine if query should retry based on error and attempt count
 */
export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
  maxRetries = 3
): boolean {
  // Don't retry if max attempts reached
  if (failureCount >= maxRetries) return false;

  // Only retry if error is retryable
  return isRetryableError(error);
}

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Network error
  if (isNetworkError(error)) {
    return new AppError('Network connection failed', {
      isRetryable: true,
    });
  }

  // API response error
  if (error && typeof error === 'object') {
    const status = 'status' in error ? (error.status as number) : undefined;
    const message =
      'message' in error ? String(error.message) : 'An error occurred';
    const code = 'code' in error ? String(error.code) : undefined;
    const errors =
      'errors' in error
        ? (error.errors as Record<string, string[]>)
        : undefined;

    return new AppError(message, {
      status,
      code,
      errors,
      isRetryable: isRetryableError(error),
    });
  }

  // Fallback
  return new AppError(getErrorMessage(error), {
    isRetryable: false,
  });
}
