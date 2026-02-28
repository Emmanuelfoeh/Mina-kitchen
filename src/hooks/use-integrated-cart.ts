/**
 * Cart Integration Utilities
 *
 * Bridges TanStack Query with Zustand cart store for seamless integration.
 * Use these helpers in components that need to work with both systems.
 */

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useUserStore } from '@/stores/user-store';
import {
  useCart,
  useInvalidateCart,
  useSyncCartWithQuery,
} from '@/hooks/queries';

/**
 * Comprehensive cart hook that integrates both Zustand and TanStack Query
 *
 * For guest users: Uses Zustand store directly
 * For authenticated users: Syncs between Zustand and TanStack Query
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   addItem,
 *   isLoading,
 *   totalItems
 * } = useIntegratedCart();
 * ```
 */
export function useIntegratedCart() {
  const { isAuthenticated } = useUserStore();
  const syncCartWithQuery = useSyncCartWithQuery();
  const invalidateCart = useInvalidateCart();

  // Zustand store state
  const zustandItems = useCartStore(state => state.items);
  const zustandAddItem = useCartStore(state => state.addItem);
  const zustandRemoveItem = useCartStore(state => state.removeItem);
  const zustandUpdateQuantity = useCartStore(state => state.updateQuantity);
  const zustandClearCart = useCartStore(state => state.clearCart);
  const zustandIsSyncing = useCartStore(state => state.isSyncing);
  const zustandGetTotal = useCartStore(state => state.getTotal);
  const zustandGetSubtotal = useCartStore(state => state.getSubtotal);
  const zustandGetTotalItems = useCartStore(state => state.getTotalItems);

  // TanStack Query state (only for authenticated users)
  const {
    data: queryCart,
    isLoading: queryIsLoading,
    isFetching: queryIsFetching,
  } = useCart();

  // Sync Zustand items with TanStack Query cache when items change
  useEffect(() => {
    if (isAuthenticated && zustandItems.length > 0) {
      syncCartWithQuery(zustandItems);
    }
  }, [isAuthenticated, zustandItems, syncCartWithQuery]);

  // Wrap mutations to invalidate TanStack Query cache
  const addItem = async (item: Parameters<typeof zustandAddItem>[0]) => {
    await zustandAddItem(item);
    if (isAuthenticated) {
      invalidateCart();
    }
  };

  const removeItem = async (itemId: string) => {
    await zustandRemoveItem(itemId);
    if (isAuthenticated) {
      invalidateCart();
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await zustandUpdateQuantity(itemId, quantity);
    if (isAuthenticated) {
      invalidateCart();
    }
  };

  const clearCart = async () => {
    await zustandClearCart();
    if (isAuthenticated) {
      invalidateCart();
    }
  };

  // For authenticated users, prefer server data if available
  const items =
    isAuthenticated && queryCart?.items ? queryCart.items : zustandItems;

  const totalItems =
    isAuthenticated && queryCart?.totalItems !== undefined
      ? queryCart.totalItems
      : zustandGetTotalItems();

  const subtotal =
    isAuthenticated && queryCart?.subtotal !== undefined
      ? queryCart.subtotal
      : zustandGetSubtotal();

  const isLoading = isAuthenticated
    ? queryIsLoading || zustandIsSyncing
    : zustandIsSyncing;

  const isSyncing = queryIsFetching || zustandIsSyncing;

  return {
    // Data
    items,
    totalItems,
    subtotal,
    total: zustandGetTotal(), // Always calculate fresh total

    // State
    isLoading,
    isSyncing,
    isAuthenticated,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,

    // Utilities
    getTotal: zustandGetTotal,
    getSubtotal: zustandGetSubtotal,
  };
}

/**
 * Hook to handle auth state changes and cart synchronization
 * Call this in a root layout or provider that handles auth
 *
 * @example
 * ```tsx
 * // In app layout or auth provider
 * useCartAuthSync();
 * ```
 */
export function useCartAuthSync() {
  const { isAuthenticated, user } = useUserStore();
  const setCartAuthenticated = useCartStore(state => state.setAuthenticated);
  const setCurrentUserId = useCartStore(state => state.setCurrentUserId);
  const invalidateCart = useInvalidateCart();

  useEffect(() => {
    setCartAuthenticated(isAuthenticated);
    setCurrentUserId(user?.id || null);

    // Invalidate cart queries when auth state changes
    if (isAuthenticated) {
      invalidateCart();
    }
  }, [
    isAuthenticated,
    user?.id,
    setCartAuthenticated,
    setCurrentUserId,
    invalidateCart,
  ]);
}
