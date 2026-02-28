import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { APIResponse, CartItem } from '@/types';
import { useUserStore } from '@/stores/user-store';

interface CartData {
  id: string | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

/**
 * Query hook for fetching cart data from server (authenticated users only)
 *
 * For guest users, use the Zustand cart store directly via useCartStore()
 * This hook is primarily for syncing server cart state with React Query cache
 *
 * @example
 * ```tsx
 * const { data: cart, isLoading } = useCart();
 * const items = cart?.items || [];
 * ```
 */
export function useCart() {
  const { isAuthenticated } = useUserStore();

  return useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: async () => {
      const response = await apiGet<APIResponse<CartData>>('/api/cart');
      return response.data;
    },
    // Only fetch if user is authenticated
    enabled: isAuthenticated,
    // Cart data is critical, refetch frequently
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Keep cart data in cache even when unmounted
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to manually invalidate cart queries
 * Useful after cart mutations in Zustand store
 *
 * @example
 * ```tsx
 * const invalidateCart = useInvalidateCart();
 *
 * // After adding item via Zustand
 * await cartStore.addItem(item);
 * invalidateCart();
 * ```
 */
export function useInvalidateCart() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
  };
}

/**
 * Hook to manually refetch cart data
 * Useful for forcing a cart sync
 *
 * @example
 * ```tsx
 * const refetchCart = useRefetchCart();
 * await refetchCart();
 * ```
 */
export function useRefetchCart() {
  const queryClient = useQueryClient();

  return async () => {
    return queryClient.refetchQueries({
      queryKey: queryKeys.cart.current(),
      type: 'active',
    });
  };
}

/**
 * Hook to get cart data from cache without triggering a fetch
 * Useful for optimistic updates or when you just need cached data
 *
 * @example
 * ```tsx
 * const cachedCart = useCartCache();
 * const itemCount = cachedCart?.totalItems || 0;
 * ```
 */
export function useCartCache() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartData>(queryKeys.cart.current());
}

/**
 * Hook to update cart cache directly (optimistic updates)
 *
 * @example
 * ```tsx
 * const updateCartCache = useUpdateCartCache();
 *
 * // Optimistically add item to cache
 * updateCartCache(oldCart => {
 *   if (!oldCart) return oldCart;
 *   return {
 *     ...oldCart,
 *     items: [...oldCart.items, newItem],
 *     totalItems: oldCart.totalItems + 1,
 *   };
 * });
 * ```
 */
export function useUpdateCartCache() {
  const queryClient = useQueryClient();

  return (updater: (oldData: CartData | undefined) => CartData | undefined) => {
    queryClient.setQueryData<CartData>(queryKeys.cart.current(), updater);
  };
}

/**
 * Hook to sync Zustand cart with React Query cache
 * Call this after cart mutations in Zustand to keep RQ cache in sync
 *
 * @example
 * ```tsx
 * const syncCart = useSyncCartWithQuery();
 *
 * // In a component that uses both Zustand and RQ
 * useEffect(() => {
 *   syncCart(cartStore.items);
 * }, [cartStore.items]);
 * ```
 */
export function useSyncCartWithQuery() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUserStore();

  return (items: CartItem[]) => {
    if (!isAuthenticated) return;

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    queryClient.setQueryData<CartData>(queryKeys.cart.current(), old => {
      if (!old) {
        return {
          id: null,
          items,
          totalItems,
          subtotal,
        };
      }

      return {
        ...old,
        items,
        totalItems,
        subtotal,
      };
    });
  };
}
