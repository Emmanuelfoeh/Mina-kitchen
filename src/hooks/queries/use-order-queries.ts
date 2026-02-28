import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Order } from '@/types';

/**
 * Hook to fetch orders for a customer
 */
export function useOrders(customerId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.list(customerId),
    queryFn: async ({ signal }) => {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const data = await apiGet<{ orders: Order[] }>(
        `/api/orders?customerId=${customerId}`,
        { signal }
      );
      return data.orders;
    },
    enabled: !!customerId, // Only fetch if customerId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes - orders should be relatively fresh
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds to get order status updates
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId || ''),
    queryFn: async ({ signal }) => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const data = await apiGet<{ order: Order }>(
        `/api/orders?orderId=${orderId}`,
        { signal }
      );
      return data.order;
    },
    enabled: !!orderId, // Only fetch if orderId is provided
    staleTime: 1 * 60 * 1000, // 1 minute - order details should be fresh
    refetchInterval: 15 * 1000, // Auto-refetch every 15 seconds for real-time status updates
  });
}
