import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { CartItem, SelectedCustomization } from '@/types';
import { calculateTax, calculateDeliveryFee } from '@/utils';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  lastSyncTimestamp: number;
  isHydrated: boolean;
  isAuthenticated: boolean;
  isSyncing: boolean;
  syncError: string | null;
  currentUserId: string | null;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateCustomizations: (
    itemId: string,
    customizations: SelectedCustomization[]
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  hasItems: () => boolean;
  getItemById: (itemId: string) => CartItem | undefined;
  syncCart: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setCurrentUserId: (userId: string | null) => void;
  validateCartItems: () => void;
  loadServerCart: () => Promise<void>;
  syncLocalCartToServer: () => Promise<void>;
  // Local-only methods (fallbacks)
  addItemLocally: (item: CartItem) => void;
  removeItemLocally: (itemId: string) => void;
  updateQuantityLocally: (itemId: string, quantity: number) => void;
  updateCustomizationsLocally: (
    itemId: string,
    customizations: SelectedCustomization[]
  ) => void;
}

export const useCartStore = create<CartStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        lastSyncTimestamp: Date.now(),
        isHydrated: false,
        isAuthenticated: false,
        isSyncing: false,
        syncError: null,
        currentUserId: null,

        addItem: async (item: CartItem) => {
          const state = get();

          if (state.isAuthenticated) {
            // Add to server
            try {
              set({ isSyncing: true, syncError: null });

              const response = await fetch('/api/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                  selectedCustomizations: item.selectedCustomizations,
                  specialInstructions: item.specialInstructions,
                }),
              });

              const result = await response.json();

              if (result.success) {
                // Reload cart from server
                await get().loadServerCart();
              } else {
                throw new Error(result.error || 'Failed to add item');
              }
            } catch (error) {
              console.error('Failed to add item to server cart:', error);
              set({
                syncError:
                  error instanceof Error ? error.message : 'Sync failed',
              });
              // Fall back to local storage
              get().addItemLocally(item);
            } finally {
              set({ isSyncing: false });
            }
          } else {
            // Add to local storage only
            get().addItemLocally(item);
          }
        },

        addItemLocally: (item: CartItem) => {
          console.log('Cart store addItem called with:', item);
          set(state => {
            const existingItemIndex = state.items.findIndex(
              existingItem =>
                existingItem.menuItemId === item.menuItemId &&
                JSON.stringify(existingItem.selectedCustomizations) ===
                  JSON.stringify(item.selectedCustomizations)
            );

            let updatedItems;
            if (existingItemIndex >= 0) {
              // Update quantity of existing item
              updatedItems = [...state.items];
              updatedItems[existingItemIndex].quantity += item.quantity;
              updatedItems[existingItemIndex].totalPrice =
                updatedItems[existingItemIndex].unitPrice *
                updatedItems[existingItemIndex].quantity;
              console.log('Updated existing item quantity');
            } else {
              // Add new item
              updatedItems = [...state.items, item];
              console.log(
                'Added new item to cart, total items:',
                updatedItems.length
              );
            }

            return {
              items: updatedItems,
              lastSyncTimestamp: Date.now(),
            };
          });
        },

        removeItem: async (itemId: string) => {
          const state = get();

          if (state.isAuthenticated) {
            // Remove from server
            try {
              set({ isSyncing: true, syncError: null });

              const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'DELETE',
              });

              const result = await response.json();

              if (result.success) {
                // Reload cart from server
                await get().loadServerCart();
              } else {
                throw new Error(result.error || 'Failed to remove item');
              }
            } catch (error) {
              console.error('Failed to remove item from server cart:', error);
              set({
                syncError:
                  error instanceof Error ? error.message : 'Sync failed',
              });
              // Fall back to local removal
              get().removeItemLocally(itemId);
            } finally {
              set({ isSyncing: false });
            }
          } else {
            // Remove from local storage only
            get().removeItemLocally(itemId);
          }
        },

        removeItemLocally: (itemId: string) => {
          set(state => ({
            items: state.items.filter(item => item.id !== itemId),
            lastSyncTimestamp: Date.now(),
          }));
        },

        updateQuantity: async (itemId: string, quantity: number) => {
          if (quantity <= 0) {
            await get().removeItem(itemId);
            return;
          }

          const state = get();

          if (state.isAuthenticated) {
            // Update on server
            try {
              set({ isSyncing: true, syncError: null });

              const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
              });

              const result = await response.json();

              if (result.success) {
                // Reload cart from server
                await get().loadServerCart();
              } else {
                throw new Error(result.error || 'Failed to update quantity');
              }
            } catch (error) {
              console.error('Failed to update quantity on server:', error);
              set({
                syncError:
                  error instanceof Error ? error.message : 'Sync failed',
              });
              // Fall back to local update
              get().updateQuantityLocally(itemId, quantity);
            } finally {
              set({ isSyncing: false });
            }
          } else {
            // Update locally only
            get().updateQuantityLocally(itemId, quantity);
          }
        },

        updateQuantityLocally: (itemId: string, quantity: number) => {
          set(state => ({
            items: state.items.map(item =>
              item.id === itemId
                ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
                : item
            ),
            lastSyncTimestamp: Date.now(),
          }));
        },

        updateCustomizations: async (
          itemId: string,
          customizations: SelectedCustomization[]
        ) => {
          const state = get();

          if (state.isAuthenticated) {
            // Update on server
            try {
              set({ isSyncing: true, syncError: null });

              const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  selectedCustomizations: customizations,
                }),
              });

              const result = await response.json();

              if (result.success) {
                // Reload cart from server
                await get().loadServerCart();
              } else {
                throw new Error(
                  result.error || 'Failed to update customizations'
                );
              }
            } catch (error) {
              console.error(
                'Failed to update customizations on server:',
                error
              );
              set({
                syncError:
                  error instanceof Error ? error.message : 'Sync failed',
              });
              // Fall back to local update
              get().updateCustomizationsLocally(itemId, customizations);
            } finally {
              set({ isSyncing: false });
            }
          } else {
            // Update locally only
            get().updateCustomizationsLocally(itemId, customizations);
          }
        },

        updateCustomizationsLocally: (
          itemId: string,
          customizations: SelectedCustomization[]
        ) => {
          set(state => ({
            items: state.items.map(item =>
              item.id === itemId
                ? { ...item, selectedCustomizations: customizations }
                : item
            ),
            lastSyncTimestamp: Date.now(),
          }));
        },

        clearCart: async () => {
          const state = get();

          if (state.isAuthenticated) {
            // Clear on server
            try {
              set({ isSyncing: true, syncError: null });

              const response = await fetch('/api/cart', {
                method: 'DELETE',
              });

              const result = await response.json();

              if (result.success) {
                set({
                  items: [],
                  lastSyncTimestamp: Date.now(),
                });
              } else {
                throw new Error(result.error || 'Failed to clear cart');
              }
            } catch (error) {
              console.error('Failed to clear cart on server:', error);
              set({
                syncError:
                  error instanceof Error ? error.message : 'Sync failed',
              });
              // Fall back to local clear
              set({
                items: [],
                lastSyncTimestamp: Date.now(),
              });
            } finally {
              set({ isSyncing: false });
            }
          } else {
            // Clear locally only
            set({
              items: [],
              lastSyncTimestamp: Date.now(),
            });
          }
        },

        toggleCart: () => {
          set(state => ({ isOpen: !state.isOpen }));
        },

        openCart: () => {
          set({ isOpen: true });
        },

        closeCart: () => {
          set({ isOpen: false });
        },

        getTotalItems: () => {
          return get().items.reduce((total, item) => total + item.quantity, 0);
        },

        getSubtotal: () => {
          return get().items.reduce(
            (total, item) => total + item.totalPrice,
            0
          );
        },

        getTax: () => {
          return calculateTax(get().getSubtotal());
        },

        getDeliveryFee: () => {
          return calculateDeliveryFee();
        },

        getTotal: () => {
          const subtotal = get().getSubtotal();
          const tax = get().getTax();
          const deliveryFee = get().getDeliveryFee();
          return subtotal + tax + deliveryFee;
        },

        hasItems: () => {
          return get().items.length > 0;
        },

        getItemById: (itemId: string) => {
          return get().items.find(item => item.id === itemId);
        },

        syncCart: async () => {
          // Sync cart with server if user is authenticated
          try {
            const state = get();

            if (!state.isAuthenticated) {
              // Just validate local items if not authenticated
              get().validateCartItems();
              return;
            }

            // Load cart from server
            await get().loadServerCart();

            set({ lastSyncTimestamp: Date.now(), syncError: null });
          } catch (error) {
            console.error('Failed to sync cart:', error);
            set({
              syncError: error instanceof Error ? error.message : 'Sync failed',
            });
          }
        },

        loadServerCart: async () => {
          try {
            const response = await fetch('/api/cart');
            const result = await response.json();

            if (result.success) {
              set({
                items: result.data.items,
                lastSyncTimestamp: Date.now(),
                syncError: null,
              });
            } else {
              throw new Error(result.error || 'Failed to load cart');
            }
          } catch (error) {
            console.error('Failed to load server cart:', error);
            set({
              syncError:
                error instanceof Error ? error.message : 'Failed to load cart',
            });
          }
        },

        syncLocalCartToServer: async () => {
          const state = get();

          if (!state.isAuthenticated || state.items.length === 0) {
            return;
          }

          try {
            set({ isSyncing: true, syncError: null });

            const response = await fetch('/api/cart/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: state.items }),
            });

            const result = await response.json();

            if (result.success) {
              set({
                items: result.data.items,
                lastSyncTimestamp: Date.now(),
                syncError: null,
              });
            } else {
              throw new Error(result.error || 'Failed to sync cart');
            }
          } catch (error) {
            console.error('Failed to sync local cart to server:', error);
            set({
              syncError: error instanceof Error ? error.message : 'Sync failed',
            });
          } finally {
            set({ isSyncing: false });
          }
        },

        setAuthenticated: (authenticated: boolean) => {
          const wasAuthenticated = get().isAuthenticated;
          const currentUserId = get().currentUserId;

          set({ isAuthenticated: authenticated });

          // If user just logged in and has local cart items, sync them
          if (authenticated && !wasAuthenticated && get().items.length > 0) {
            get().syncLocalCartToServer();
          } else if (authenticated && !wasAuthenticated) {
            // Load server cart if user logged in
            get().loadServerCart();
          } else if (!authenticated && wasAuthenticated) {
            // User logged out - clear the cart to prevent data leakage
            console.log('User logged out, clearing cart for security');
            set({
              items: [],
              syncError: null,
              currentUserId: null,
              lastSyncTimestamp: Date.now(),
            });

            // Clear the user-specific storage
            if (currentUserId && typeof window !== 'undefined') {
              try {
                localStorage.removeItem(`cart-storage-${currentUserId}`);
              } catch (error) {
                console.error('Failed to clear user cart storage:', error);
              }
            }
          }
        },

        setHydrated: (hydrated: boolean) => {
          set({ isHydrated: hydrated });
        },

        setCurrentUserId: (userId: string | null) => {
          set({ currentUserId: userId });
        },

        validateCartItems: () => {
          // Remove invalid items (items that no longer exist or are unavailable)
          set(state => {
            console.log(
              'Validating cart items, current count:',
              state.items.length
            );
            const validItems = state.items.filter(item => {
              // Check for required fields
              const hasRequiredFields =
                item.id &&
                item.menuItemId &&
                item.name &&
                item.quantity > 0 &&
                item.unitPrice >= 0 &&
                item.totalPrice >= 0;

              // Check if menuItemId looks like a valid CUID (starts with 'c' and is longer than 10 chars)
              // This will filter out mock data IDs like "6", "1", etc.
              const hasValidMenuItemId =
                item.menuItemId.startsWith('c') && item.menuItemId.length > 10;

              const isValid = hasRequiredFields && hasValidMenuItemId;

              if (!isValid) {
                console.log('Filtering out invalid item:', {
                  id: item.id,
                  menuItemId: item.menuItemId,
                  name: item.name,
                  hasRequiredFields,
                  hasValidMenuItemId,
                  menuItemIdLength: item.menuItemId?.length,
                  menuItemIdStartsWithC: item.menuItemId?.startsWith('c'),
                });
              }

              return isValid;
            });

            // Also clean up any customizations that might have invalid data
            const cleanedItems = validItems.map(item => ({
              ...item,
              selectedCustomizations: item.selectedCustomizations.filter(
                customization =>
                  customization.customizationId &&
                  (customization.optionIds.length > 0 ||
                    customization.textValue)
              ),
            }));

            const itemsChanged =
              validItems.length !== state.items.length ||
              cleanedItems.some(
                (item, index) =>
                  item.selectedCustomizations.length !==
                  validItems[index].selectedCustomizations.length
              );

            if (itemsChanged) {
              console.log(
                'Cart validation removed items, new count:',
                cleanedItems.length
              );
            }

            return itemsChanged
              ? {
                  items: cleanedItems,
                  lastSyncTimestamp: Date.now(),
                }
              : state;
          });
        },
      }),
      {
        name: 'cart-storage',
        partialize: state => ({
          items: state.items,
          lastSyncTimestamp: state.lastSyncTimestamp,
          // Don't persist isOpen state - should always start closed
        }),
        version: 4,
        // Handle migration from previous versions
        migrate: (persistedState: any, version: number) => {
          if (
            version === 0 ||
            version === 1 ||
            version === 2 ||
            version === 3
          ) {
            // Migration from version 0, 1, 2, or 3 to 4
            // Clear cart items to remove any data without customization names
            return {
              items: [],
              lastSyncTimestamp: Date.now(),
              isHydrated: false,
            };
          }
          return persistedState;
        },
        // Custom storage implementation for user-specific cart storage
        storage: {
          getItem: (name: string) => {
            // Check if we're on the client side
            if (typeof window === 'undefined') {
              return null;
            }

            try {
              // Try to get current user ID from user store
              let currentUserId: string | null = null;
              try {
                const userStorage = localStorage.getItem('user-storage');
                if (userStorage) {
                  const userData = JSON.parse(userStorage);
                  if (
                    userData.state?.user?.id &&
                    userData.state?.isAuthenticated
                  ) {
                    currentUserId = userData.state.user.id;
                  }
                }
              } catch (error) {
                console.log('Could not get user ID from storage:', error);
              }

              // Use user-specific storage key if authenticated, otherwise use guest key
              const storageKey = currentUserId
                ? `${name}-${currentUserId}`
                : `${name}-guest`;
              const item = localStorage.getItem(storageKey);
              return item ? JSON.parse(item) : null;
            } catch (error) {
              console.error('Failed to load cart from storage:', error);
              return null;
            }
          },
          setItem: (name: string, value: any) => {
            // Check if we're on the client side
            if (typeof window === 'undefined') {
              return;
            }

            try {
              // Try to get current user ID from user store
              let currentUserId: string | null = null;
              try {
                const userStorage = localStorage.getItem('user-storage');
                if (userStorage) {
                  const userData = JSON.parse(userStorage);
                  if (
                    userData.state?.user?.id &&
                    userData.state?.isAuthenticated
                  ) {
                    currentUserId = userData.state.user.id;
                  }
                }
              } catch (error) {
                console.log('Could not get user ID from storage:', error);
              }

              // Use user-specific storage key if authenticated, otherwise use guest key
              const storageKey = currentUserId
                ? `${name}-${currentUserId}`
                : `${name}-guest`;
              localStorage.setItem(storageKey, JSON.stringify(value));
            } catch (error) {
              console.error('Failed to save cart to storage:', error);
              // If storage is full, try to clear old data and retry
              if (
                error instanceof Error &&
                error.name === 'QuotaExceededError'
              ) {
                try {
                  // Clear other non-essential data if needed
                  localStorage.removeItem('temp-data');
                  const userStorage = localStorage.getItem('user-storage');
                  let currentUserId: string | null = null;
                  if (userStorage) {
                    const userData = JSON.parse(userStorage);
                    if (
                      userData.state?.user?.id &&
                      userData.state?.isAuthenticated
                    ) {
                      currentUserId = userData.state.user.id;
                    }
                  }
                  const storageKey = currentUserId
                    ? `${name}-${currentUserId}`
                    : `${name}-guest`;
                  localStorage.setItem(storageKey, JSON.stringify(value));
                } catch (retryError) {
                  console.error(
                    'Failed to save cart after cleanup:',
                    retryError
                  );
                }
              }
            }
          },
          removeItem: (name: string) => {
            // Check if we're on the client side
            if (typeof window === 'undefined') {
              return;
            }

            try {
              // Remove both guest and user-specific storage
              localStorage.removeItem(`${name}-guest`);

              // Try to get current user ID and remove user-specific storage
              try {
                const userStorage = localStorage.getItem('user-storage');
                if (userStorage) {
                  const userData = JSON.parse(userStorage);
                  if (userData.state?.user?.id) {
                    localStorage.removeItem(
                      `${name}-${userData.state.user.id}`
                    );
                  }
                }
              } catch (error) {
                console.log(
                  'Could not clear user-specific cart storage:',
                  error
                );
              }
            } catch (error) {
              console.error('Failed to remove cart from storage:', error);
            }
          },
        },
        // Called when the store is hydrated from storage
        onRehydrateStorage: () => state => {
          if (state) {
            state.setHydrated(true);
            // Validate cart items after hydration
            state.validateCartItems();
            // Sync with server if needed
            state.syncCart();
          }
        },
      }
    )
  )
);
