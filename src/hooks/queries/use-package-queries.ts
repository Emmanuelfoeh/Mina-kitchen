import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Package } from '@/types';

/**
 * Hook to fetch all packages
 */
export function usePackages(filters?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.packages.list(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }

      const url = `/api/packages${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<Package[]>(url, { signal });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single package by slug
 */
export function usePackage(slug: string) {
  return useQuery({
    queryKey: queryKeys.packages.detail(slug),
    queryFn: async ({ signal }) => {
      const data = await apiGet<Package>(`/api/packages/slug/${slug}`, {
        signal,
      });
      return data;
    },
    enabled: !!slug, // Only run if slug is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Suspense version of usePackages
 */
export function usePackagesSuspense(filters?: { status?: string }) {
  return useSuspenseQuery({
    queryKey: queryKeys.packages.list(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }

      const url = `/api/packages${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<Package[]>(url, { signal });
      return data;
    },
  });
}
