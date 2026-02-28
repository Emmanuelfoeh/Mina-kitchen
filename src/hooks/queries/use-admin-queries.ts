import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Order, MenuItem, Package } from '@/types';

/**
 * Admin Dashboard Stats Hook
 * Used by multiple dashboard components - automatically deduplicated
 */
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard.stats(),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{
        metrics: {
          totalRevenue: { value: number; change: number };
          totalOrders: { value: number; change: number };
          avgOrderValue: { value: number; change: number };
          pendingDeliveries: { value: number };
        };
        recentOrders: Order[];
        popularDishes: Array<{
          id: string;
          name: string;
          image: string;
          orderCount: number;
          revenue: number;
        }>;
        dailyRevenue: Array<{
          date: string;
          revenue: number;
          orders: number;
        }>;
      }>('/api/admin/dashboard/stats', { signal });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    refetchInterval: 60 * 1000, // Auto-refetch every minute when tab is active
  });
}

/**
 * Admin Orders List Hook
 */
export function useAdminOrders(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.orders.list(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        page: (filters?.page || 1).toString(),
        limit: (filters?.limit || 20).toString(),
        search: filters?.search || '',
        status: filters?.status || '',
        sortBy: filters?.sortBy || 'createdAt',
        sortOrder: filters?.sortOrder || 'desc',
      });

      const data = await apiGet<{
        orders: Order[];
        pagination: {
          page: number;
          limit: number;
          totalCount: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(`/api/admin/orders?${params.toString()}`, { signal });
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Admin Single Order Detail Hook
 */
export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.admin.orders.detail(orderId),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{ order: Order }>(
        `/api/admin/orders/${orderId}`,
        { signal }
      );
      return data.order;
    },
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - order details should be fresh
    refetchInterval: 15 * 1000, // Auto-refetch every 15 seconds
  });
}

/**
 * Admin Order Stats Hook
 */
export function useAdminOrderStats() {
  return useQuery({
    queryKey: queryKeys.admin.orders.stats(),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{
        total: number;
        pending: number;
        confirmed: number;
        preparing: number;
        ready: number;
        outForDelivery: number;
        delivered: number;
        cancelled: number;
        todayOrders: number;
        todayRevenue: number;
      }>('/api/admin/orders/stats', { signal });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

/**
 * Admin Order Timeline Hook
 */
export function useAdminOrderTimeline(orderId: string) {
  return useQuery({
    queryKey: queryKeys.admin.orders.timeline(orderId),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{
        timeline: Array<{
          id: string;
          status: string;
          note?: string;
          createdAt: string;
          createdBy?: {
            id: string;
            name: string;
            email: string;
          };
        }>;
      }>(`/api/admin/orders/${orderId}/timeline`, { signal });
      return data.timeline;
    },
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Admin Menu Items Hook
 */
export function useAdminMenuItems(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.menu.items(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = `/api/admin/menu/items${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<{
        items: MenuItem[];
        pagination: {
          page: number;
          limit: number;
          totalCount: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(url, { signal });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Admin Menu Stats Hook
 */
export function useAdminMenuStats() {
  return useQuery({
    queryKey: queryKeys.admin.menu.stats(),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{
        overview: {
          totalItems: number;
          activeItems: number;
          inactiveItems: number;
          soldOutItems: number;
          lowStockItems: number;
          totalCategories: number;
          activeCategories: number;
          recentItems: number;
        };
        pricing: {
          averagePrice: number;
          minPrice: number;
          maxPrice: number;
        };
        distribution: {
          byCategory: Array<{
            categoryId: string;
            categoryName: string;
            itemCount: number;
          }>;
          byStatus: Array<{
            status: string;
            count: number;
          }>;
        };
      }>('/api/admin/menu/stats', { signal });
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - stats change slowly
  });
}

/**
 * Admin Menu Categories Hook
 */
export function useAdminMenuCategories() {
  return useQuery({
    queryKey: queryKeys.admin.menu.categories(),
    queryFn: async ({ signal }) => {
      const data = await apiGet<
        Array<{
          id: string;
          name: string;
          slug: string;
          description?: string;
          displayOrder: number;
          itemCount?: number;
        }>
      >('/api/admin/menu/categories', { signal });
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change infrequently
  });
}

/**
 * Admin Packages List Hook
 */
export function useAdminPackages(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.packages.list(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = `/api/admin/packages${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<{
        packages: Package[];
        pagination: {
          page: number;
          limit: number;
          totalCount: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(url, { signal });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Admin Package Detail Hook
 */
export function useAdminPackage(packageId: string) {
  return useQuery({
    queryKey: queryKeys.admin.packages.detail(packageId),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{ package: Package }>(
        `/api/admin/packages/${packageId}`,
        { signal }
      );
      return data.package;
    },
    enabled: !!packageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Admin Package Stats Hook
 */
export function useAdminPackageStats() {
  return useQuery({
    queryKey: queryKeys.admin.packages.stats(),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{
        totalPackages: number;
        activePackages: number;
        inactivePackages: number;
        totalSubscriptions: number;
        totalRevenue: number;
        averagePackagePrice: number;
      }>('/api/admin/packages/stats', { signal });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Admin Users List Hook
 */
export function useAdminUsers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(filters),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);

      const url = `/api/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiGet<
        {
          id: string;
          name: string;
          email: string;
          role: string;
          phone?: string;
          createdAt: string;
        }[]
      >(url, { signal });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Admin User Detail Hook
 */
export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(userId),
    queryFn: async ({ signal }) => {
      const data = await apiGet<{
        id: string;
        name: string;
        email: string;
        role: string;
        phone?: string;
        addresses: Array<{
          id: string;
          label: string;
          street: string;
          city: string;
          state: string;
          zipCode: string;
          isDefault: boolean;
        }>;
        createdAt: string;
        updatedAt: string;
      }>(`/api/admin/users/${userId}`, { signal });
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
