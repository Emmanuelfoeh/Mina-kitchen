import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { APIResponse, CartItem, SelectedCustomization } from '@/types';

interface AddCartItemData {
  menuItemId: string;
  quantity: number;
  selectedCustomizations?: SelectedCustomization[];
  specialInstructions?: string;
}

interface UpdateCartItemData {
  itemId: string;
  quantity?: number;
  selectedCustomizations?: SelectedCustomization[];
  specialInstructions?: string;
}

/**
 * Mutation hook for adding items to cart (server-side)
 *
 * Note: This is a TanStack Query mutation for server operations.
 * For guest users, use the Zustand cart store's addItem method instead.
 *
 * @example
 * ```tsx
 * const addToCart = useAddToCart();
 *
 * addToCart.mutate({
 *   menuItemId: 'item-123',
 *   quantity: 2,
 *   selectedCustomizations: [],
 * });
 * ```
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddCartItemData) => {
      return apiPost<APIResponse<{ item: CartItem }>>('/api/cart/items', data);
    },
    onSuccess: () => {
      // Invalidate cart queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      toast.success('Added to cart', {
        description: 'Item has been added to your cart successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to add to cart', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for updating cart item (server-side)
 *
 * @example
 * ```tsx
 * const updateCartItem = useUpdateCartItem();
 *
 * updateCartItem.mutate({
 *   itemId: 'cart-item-123',
 *   quantity: 3,
 * });
 * ```
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, ...data }: UpdateCartItemData) => {
      return apiPatch<APIResponse<{ item: CartItem }>>(
        `/api/cart/items/${itemId}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      toast.success('Cart updated', {
        description: 'Your cart has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update cart', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for removing item from cart (server-side)
 *
 * @example
 * ```tsx
 * const removeFromCart = useRemoveFromCart();
 *
 * removeFromCart.mutate('cart-item-123');
 * ```
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return apiDelete<APIResponse<{ success: boolean }>>(
        `/api/cart/items/${itemId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      toast.success('Item removed', {
        description: 'Item has been removed from your cart.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove item', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for clearing entire cart (server-side)
 *
 * @example
 * ```tsx
 * const clearCart = useClearCart();
 *
 * clearCart.mutate();
 * ```
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiDelete<APIResponse<{ success: boolean }>>('/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      toast.success('Cart cleared', {
        description: 'All items have been removed from your cart.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to clear cart', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Mutation hook for syncing local cart to server (auth transition)
 *
 * Use this when user logs in and has local cart items that need to be synced
 *
 * @example
 * ```tsx
 * const syncCart = useSyncLocalCart();
 *
 * // After login
 * syncCart.mutate({ items: localCartItems });
 * ```
 */
export function useSyncLocalCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { items: CartItem[] }) => {
      return apiPost<APIResponse<{ items: CartItem[] }>>(
        '/api/cart/sync',
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      toast.success('Cart synced', {
        description: 'Your cart has been synced successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to sync cart', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
