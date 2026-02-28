import { QueryClient } from '@tanstack/react-query';
import {
  createQueryCacheWithErrorHandler,
  createMutationCacheWithErrorHandler,
} from './query-error-handlers';
import { shouldRetryQuery, getRetryDelay } from './error-utils';

// Default query options with enhanced error handling
const defaultQueryOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for this duration
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
    retry: (failureCount: number, error: unknown) => {
      // Use smart retry logic from error-utils
      return shouldRetryQuery(failureCount, error);
    },
    retryDelay: (attemptIndex: number) => {
      // Exponential backoff with jitter
      return getRetryDelay(attemptIndex);
    },
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchOnReconnect: true, // Refetch when network reconnects
    // Automatically refetch on mount if data is stale
    refetchOnMount: true,
  },
  mutations: {
    retry: false, // Don't retry mutations by default (too risky)
    // Individual mutations can override this if needed
  },
};

// Create a singleton query client
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create the QueryClient instance
 *
 * - Server: creates a new client for each request
 * - Browser: reuses the same client across renders
 */
export function getQueryClient(): QueryClient {
  // Server: always create a new query client
  if (globalThis.window === undefined) {
    return new QueryClient({
      defaultOptions: defaultQueryOptions,
      queryCache: createQueryCacheWithErrorHandler(),
      mutationCache: createMutationCacheWithErrorHandler(),
    });
  }

  // Browser: reuse the same query client
  browserQueryClient ??= new QueryClient({
    defaultOptions: defaultQueryOptions,
    queryCache: createQueryCacheWithErrorHandler(),
    mutationCache: createMutationCacheWithErrorHandler(),
  });

  return browserQueryClient;
}

/**
 * Reset the query client (useful for logout)
 *
 * Clears all cached data and cancels pending queries
 */
export function resetQueryClient() {
  if (browserQueryClient) {
    browserQueryClient.clear();
  }
}

/**
 * Invalidate all queries (useful for force refresh)
 */
export async function invalidateAllQueries() {
  if (browserQueryClient) {
    await browserQueryClient.invalidateQueries();
  }
}

/**
 * Remove specific queries from cache
 */
export function removeQueries(queryKey: unknown[]) {
  if (browserQueryClient) {
    browserQueryClient.removeQueries({ queryKey });
  }
}
