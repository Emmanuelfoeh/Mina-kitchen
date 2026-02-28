/**
 * Error Recovery Hooks for TanStack Query
 *
 * Provides hooks for error handling, recovery, and retry logic.
 */
'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRetryDelay, isRetryableError, logError } from '@/lib/error-utils';

/**
 * Hook for resetting specific queries on error
 */
export function useQueryErrorReset(queryKey?: unknown[]) {
  const queryClient = useQueryClient();

  const resetQuery = useCallback(async () => {
    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey });
    }
  }, [queryClient, queryKey]);

  const resetAll = useCallback(async () => {
    await queryClient.invalidateQueries();
    await queryClient.refetchQueries();
  }, [queryClient]);

  return { resetQuery, resetAll };
}

/**
 * Hook for retry logic with exponential backoff
 */
export function useRetryWithBackoff(options?: {
  maxRetries?: number;
  baseDelay?: number;
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onError,
    onSuccess,
  } = options || {};

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<unknown>(null);

  const retry = useCallback(
    async (fn: () => Promise<void>) => {
      if (retryCount >= maxRetries) {
        const error = new Error('Max retries exceeded');
        setLastError(error);
        onError?.(error);
        return;
      }

      setIsRetrying(true);

      try {
        // Wait with exponential backoff
        if (retryCount > 0) {
          const delay = getRetryDelay(retryCount, baseDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Execute function
        await fn();

        // Success - reset state
        setRetryCount(0);
        setLastError(null);
        onSuccess?.();
      } catch (error) {
        setLastError(error);
        setRetryCount(prev => prev + 1);

        // Check if should retry
        if (retryCount < maxRetries - 1 && isRetryableError(error)) {
          // Will retry on next call
          logError(error, {
            action: 'retry_scheduled',
            metadata: { retryCount: retryCount + 1 },
          });
        } else {
          // Max retries or non-retryable error
          onError?.(error);
        }

        throw error;
      } finally {
        setIsRetrying(false);
      }
    },
    [retryCount, maxRetries, baseDelay, onError, onSuccess]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    isRetrying,
    retryCount,
    lastError,
    canRetry: retryCount < maxRetries && isRetryableError(lastError),
  };
}

/**
 * Hook for handling mutation errors with automatic retry
 */
export function useMutationErrorHandler(options?: {
  onError?: (error: unknown) => void;
  retryMutation?: boolean;
  maxRetries?: number;
}) {
  const { onError, retryMutation = false, maxRetries = 2 } = options || {};
  const [error, setError] = useState<unknown>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback(
    (err: unknown) => {
      setError(err);

      // Call custom error handler
      onError?.(err);

      // Log error
      logError(err, {
        action: 'mutation_error',
        metadata: { retryCount },
      });
    },
    [onError, retryCount]
  );

  const shouldRetry = useCallback(
    (err: unknown): boolean => {
      if (!retryMutation) return false;
      if (retryCount >= maxRetries) return false;
      return isRetryableError(err);
    },
    [retryMutation, retryCount, maxRetries]
  );

  const incrementRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setError(null);
  }, []);

  return {
    error,
    handleError,
    shouldRetry,
    incrementRetry,
    resetRetry,
    retryCount,
  };
}

/**
 * Hook for centralized error state management
 */
export function useErrorState() {
  const [error, setError] = useState<unknown>(null);
  const [errorHistory, setErrorHistory] = useState<
    Array<{ error: unknown; timestamp: number }>
  >([]);

  const recordError = useCallback((err: unknown) => {
    setError(err);
    setErrorHistory(prev => [...prev, { error: err, timestamp: Date.now() }]);

    // Log error
    logError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  const hasRecentError = useCallback(
    (withinMs: number = 5000): boolean => {
      if (errorHistory.length === 0) return false;
      const lastError = errorHistory.at(-1)!;
      return Date.now() - lastError.timestamp < withinMs;
    },
    [errorHistory]
  );

  return {
    error,
    errorHistory,
    recordError,
    clearError,
    clearHistory,
    hasRecentError,
  };
}

/**
 * Hook for handling offline/online state and retrying queries
 */
export function useOnlineErrorRecovery() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(
    globalThis.window === undefined ? true : navigator.onLine
  );

  const handleOnline = useCallback(async () => {
    setIsOnline(true);

    // Refetch all queries that failed due to network errors
    await queryClient.refetchQueries({
      type: 'active',
      stale: true,
    });
  }, [queryClient]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  // Set up event listeners (would be done in useEffect in actual use)
  // This is a simplified version - actual implementation would need useEffect

  return {
    isOnline,
    handleOnline,
    handleOffline,
  };
}

/**
 * Hook for wrapping async functions with error handling
 */
export function useErrorHandler<
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  fn: T,
  options?: {
    onError?: (error: unknown) => void;
    rethrow?: boolean;
  }
): [T, { error: unknown; clearError: () => void }] {
  const [error, setError] = useState<unknown>(null);

  const wrappedFn = useCallback(
    async (...args: Parameters<T>) => {
      try {
        const result = await fn(...args);
        setError(null);
        return result;
      } catch (err) {
        setError(err);
        logError(err, {
          action: 'async_function_error',
        });

        if (options?.onError) {
          options.onError(err);
        }

        if (options?.rethrow ?? true) {
          throw err;
        }
      }
    },
    [fn, options]
  ) as T;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return [wrappedFn, { error, clearError }];
}
