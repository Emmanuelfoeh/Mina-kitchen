import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, SelectedCustomization } from '@/types';
import { calculateTax, calculateDeliveryFee } from '@/utils';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomizations: (
    itemId: string,
    customizations: SelectedCustomization[]
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: CartItem) => {
        set(state => {
          const existingItemIndex = state.items.findIndex(
            existingItem =>
              existingItem.menuItemId === item.menuItemId &&
              JSON.stringify(existingItem.selectedCustomizations) ===
                JSON.stringify(item.selectedCustomizations)
          );

          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += item.quantity;
            updatedItems[existingItemIndex].totalPrice =
              updatedItems[existingItemIndex].unitPrice *
              updatedItems[existingItemIndex].quantity;

            return { items: updatedItems };
          } else {
            // Add new item
            return { items: [...state.items, item] };
          }
        });
      },

      removeItem: (itemId: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== itemId),
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
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
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
    }),
    {
      name: 'cart-storage',
      partialize: state => ({ items: state.items }),
    }
  )
);
