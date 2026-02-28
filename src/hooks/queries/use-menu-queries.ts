import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MenuItem, MenuCategory } from '@/types';

/**
 * Hook to fetch menu categories
 */
export function useMenuCategories() {
  return useQuery({
    queryKey: queryKeys.menu.categories(),
    queryFn: async () => {
      const data = await apiGet<MenuCategory[]>('/api/menu/categories');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change infrequently
  });
}

/**
 * Hook to fetch menu items with optional filters
 */
export function useMenuItems(filters?: {
  category?: string;
  search?: string;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.menu.items(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const url = `/api/menu/items${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<MenuItem[]>(url, { signal });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single menu item by slug
 */
export function useMenuItem(slug: string) {
  return useQuery({
    queryKey: queryKeys.menu.item(slug),
    queryFn: async ({ signal }) => {
      const data = await apiGet<MenuItem>(`/api/menu/items/${slug}`, {
        signal,
      });
      return data;
    },
    enabled: !!slug, // Only run query if slug is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch related items for a menu item
 */
export function useRelatedMenuItems(slug: string) {
  return useQuery({
    queryKey: queryKeys.menu.itemRelated(slug),
    queryFn: async ({ signal }) => {
      const data = await apiGet<MenuItem[]>(`/api/menu/items/${slug}/related`, {
        signal,
      });
      return data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes - related items change less frequently
  });
}

/**
 * Suspense version of useMenuItems - for use with React Suspense
 * Throws promise while loading
 */
export function useMenuItemsSuspense(filters?: {
  category?: string;
  search?: string;
  status?: string;
  limit?: number;
}) {
  return useSuspenseQuery({
    queryKey: queryKeys.menu.items(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const url = `/api/menu/items${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<MenuItem[]>(url, { signal });
      return data;
    },
  });
}
