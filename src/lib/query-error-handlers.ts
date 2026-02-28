/**
 * Query Error Handlers for TanStack Query
 *
 * Centralized error handling for queries and mutations.
 * Provides default handlers and customizable error responses.
 */

import { QueryCache, MutationCache } from '@tanstack/react-query';
import {
  showErrorToast,
  logError,
  getErrorCategory,
  ErrorCategory,
} from './error-utils';

/**
 * Default error handler for queries
 *
 * Called when a query fails. Logs the error and shows appropriate feedback.
 */
export function handleQueryError(
  error: unknown,
  queryKey?: readonly unknown[]
): void {
  const category = getErrorCategory(error);

  // Log error with query context
  logError(error, {
    action: 'query_failed',
    metadata: {
      queryKey: queryKey ? JSON.stringify(queryKey) : undefined,
    },
  });

  // Don't show toast for auth errors (handled by middleware)
  if (category === ErrorCategory.AUTH) {
    return;
  }

  // Don't show toast for 404 errors in background queries
  // (components should handle these explicitly)
  if (category === ErrorCategory.NOT_FOUND) {
    return;
  }

  // Show toast for network and server errors
  if (category === ErrorCategory.NETWORK || category === ErrorCategory.SERVER) {
    showErrorToast(error, {
      title: 'Failed to load data',
      duration: 5000,
    });
  }
}

/**
 * Default error handler for mutations
 *
 * Called when a mutation fails. Shows user feedback.
 */
export function handleMutationError(
  error: unknown,
  variables?: unknown,
  context?: {
    operationName?: string;
  }
): void {
  const category = getErrorCategory(error);

  // Log error with mutation context
  logError(error, {
    action: 'mutation_failed',
    metadata: {
      variables: variables ? JSON.stringify(variables) : undefined,
      operationName: context?.operationName,
    },
  });

  // Show toast for all mutation errors
  // (mutations are user-initiated, so user should see feedback)
  showErrorToast(error, {
    title: context?.operationName
      ? `Failed to ${context.operationName}`
      : 'Operation failed',
    duration: category === ErrorCategory.VALIDATION ? 6000 : 5000,
  });
}

/**
 * Create QueryCache with default error handler
 */
export function createQueryCacheWithErrorHandler(): QueryCache {
  return new QueryCache({
    onError: (error, query) => {
      handleQueryError(error, query.queryKey);
    },
  });
}

/**
 * Create MutationCache with default error handler
 */
export function createMutationCacheWithErrorHandler(): MutationCache {
  return new MutationCache({
    onError: (error, variables, context) => {
      // Extract operation name from mutation key if available
      const mutationKey = (context as { mutationKey?: unknown[] })?.mutationKey;
      const operationName =
        mutationKey && Array.isArray(mutationKey) ? mutationKey[0] : undefined;

      handleMutationError(error, variables, {
        operationName:
          typeof operationName === 'string' ? operationName : undefined,
      });
    },
  });
}

/**
 * Error handler specifically for authentication errors
 *
 * Redirects user to login page with return URL
 */
export function handleAuthError(returnUrl?: string): void {
  const redirectUrl = returnUrl || globalThis.location.pathname;

  // Store intended destination
  sessionStorage.setItem('auth_redirect', redirectUrl);

  // Redirect to login
  globalThis.location.href = `/auth/login?callbackUrl=${encodeURIComponent(redirectUrl)}`;
}

/**
 * Wrapper for query error handling with custom logic
 */
export function createQueryErrorHandler(options?: {
  onAuthError?: () => void;
  onNetworkError?: (error: unknown) => void;
  onServerError?: (error: unknown) => void;
  showToast?: boolean;
}) {
  return (error: unknown, queryKey?: unknown[]) => {
    const category = getErrorCategory(error);

    // Handle auth errors
    if (category === ErrorCategory.AUTH) {
      if (options?.onAuthError) {
        options.onAuthError();
      } else {
        handleAuthError();
      }
      return;
    }

    // Handle network errors
    if (category === ErrorCategory.NETWORK && options?.onNetworkError) {
      options.onNetworkError(error);
      return;
    }

    // Handle server errors
    if (category === ErrorCategory.SERVER && options?.onServerError) {
      options.onServerError(error);
      return;
    }

    // Default handling
    if (options?.showToast !== false) {
      handleQueryError(error, queryKey);
    }
  };
}

/**
 * Wrapper for mutation error handling with custom logic
 */
export function createMutationErrorHandler(options?: {
  operationName?: string;
  onAuthError?: () => void;
  onValidationError?: (error: unknown) => void;
  showToast?: boolean;
}) {
  return (error: unknown, variables?: unknown) => {
    const category = getErrorCategory(error);

    // Handle auth errors
    if (category === ErrorCategory.AUTH) {
      if (options?.onAuthError) {
        options.onAuthError();
      } else {
        handleAuthError();
      }
      return;
    }

    // Handle validation errors
    if (category === ErrorCategory.VALIDATION && options?.onValidationError) {
      options.onValidationError(error);
      return;
    }

    // Default handling
    if (options?.showToast !== false) {
      handleMutationError(error, variables, {
        operationName: options?.operationName,
      });
    }
  };
}

/**
 * Silent error handler (logs but doesn't show UI feedback)
 */
export function silentErrorHandler(error: unknown, context?: string): void {
  logError(error, {
    action: 'silent_error',
    metadata: { context },
  });
}
