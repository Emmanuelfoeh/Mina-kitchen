import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiPost, apiPatch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { APIResponse, SelectedCustomization } from '@/types';

interface CreateOrderData {
  items: Array<{
    menuItemId: string;
    quantity: number;
    customizations?: SelectedCustomization[];
  }>;
  deliveryType: 'DELIVERY' | 'PICKUP';
  scheduledFor?: string;
  notes?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    instructions?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

/**
 * Mutation hook for creating new orders
 * Automatically invalidates order queries on success
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      return apiPost<APIResponse<Order>>('/api/orders', data);
    },
    onSuccess: response => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });

      // Show success toast
      toast.success('Order placed successfully!', {
        description: `Order #${response.data.orderNumber} has been created.`,
      });

      // Navigate to order confirmation
      router.push(`/order-confirmation?orderId=${response.data.id}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to create order', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for canceling orders (customer side)
 * Automatically updates cache and refetches
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return apiPatch<APIResponse<Order>>(`/api/orders/${orderId}`, {
        status: 'CANCELLED',
      });
    },
    onSuccess: (response, orderId) => {
      // Invalidate specific order query
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(orderId),
      });

      // Invalidate orders list
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.list(),
      });

      toast.success('Order cancelled', {
        description: 'Your order has been cancelled successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel order', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating order status (admin side)
 * With optimistic update for instant UI feedback
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      return apiPatch<APIResponse<Order>>(`/api/admin/orders/${orderId}`, {
        status,
      });
    },
    // Optimistic update - update UI immediately before server responds
    onMutate: async ({ orderId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.admin.orders.all(),
      });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(
        queryKeys.admin.orders.all()
      );

      // Optimistically update to new value
      queryClient.setQueryData<{ orders: Order[] }>(
        queryKeys.admin.orders.all(),
        old => {
          if (!old?.orders) return old;

          return {
            ...old,
            orders: old.orders.map((order: Order) =>
              order.id === orderId ? { ...order, status } : order
            ),
          };
        }
      );

      return { previousOrders };
    },
    onSuccess: (response, { orderId }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.detail(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.stats(),
      });

      toast.success('Order status updated', {
        description: `Order status changed to ${response.data.status}`,
      });
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousOrders) {
        queryClient.setQueryData(
          queryKeys.admin.orders.all(),
          context.previousOrders
        );
      }

      toast.error('Failed to update order status', {
        description: error.message || 'Please try again.',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all(),
      });
    },
  });
}

/**
 * Mutation hook for bulk updating order status
 */
export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderIds,
      status,
    }: {
      orderIds: string[];
      status: string;
    }) => {
      return apiPatch<APIResponse<{ updated: number }>>('/api/admin/orders', {
        orderIds,
        status,
        bulkAction: true,
      });
    },
    onSuccess: (response, { status }) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.stats(),
      });

      toast.success('Orders updated', {
        description: `${response.data.updated} orders updated to ${status}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update orders', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
