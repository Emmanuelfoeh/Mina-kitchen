'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { getQueryClient } from '@/lib/query-client';

/**
 * Query Provider Component
 *
 * Wraps the application with TanStack Query's QueryClientProvider.
 * Includes React Query DevTools in development mode.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable query client instance
  // useState ensures the client is created only once per component lifecycle
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
