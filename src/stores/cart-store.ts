import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { CartItem, SelectedCustomization } from '@/types';
import { calculateTax, calculateDeliveryFee } from '@/utils';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  lastSyncTimestamp: number;
  isHydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomizations: (
    itemId: string,
    customizations: SelectedCustomization[]
  ) => void;
  clearCart: () => void;
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
  validateCartItems: () => void;
}

export const useCartStore = create<CartStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        lastSyncTimestamp: Date.now(),
        isHydrated: false,

        addItem: (item: CartItem) => {
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

        removeItem: (itemId: string) => {
          set(state => ({
            items: state.items.filter(item => item.id !== itemId),
            lastSyncTimestamp: Date.now(),
          }));
        },

        updateQuantity: (itemId: string, quantity: number) => {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          set(state => ({
            items: state.items.map(item =>
              item.id === itemId
                ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
                : item
            ),
            lastSyncTimestamp: Date.now(),
          }));
        },

        updateCustomizations: (
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

        clearCart: () => {
          set({
            items: [],
            lastSyncTimestamp: Date.now(),
          });
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

            // Only sync if we have items and user is authenticated
            if (state.items.length === 0) return;

            // In a real app, this would sync with the server
            // For now, we'll just validate the cart items
            get().validateCartItems();

            set({ lastSyncTimestamp: Date.now() });
          } catch (error) {
            console.error('Failed to sync cart:', error);
          }
        },

        setHydrated: (hydrated: boolean) => {
          set({ isHydrated: hydrated });
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
        // Custom storage implementation for better error handling
        storage: {
          getItem: (name: string) => {
            // Check if we're on the client side
            if (typeof window === 'undefined') {
              return null;
            }

            try {
              const item = localStorage.getItem(name);
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
              localStorage.setItem(name, JSON.stringify(value));
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
                  localStorage.setItem(name, JSON.stringify(value));
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
              localStorage.removeItem(name);
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
