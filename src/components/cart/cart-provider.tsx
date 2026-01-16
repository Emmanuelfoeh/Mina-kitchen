'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores';
import {
  CartPersistenceProvider,
  useCartPersistence,
} from './cart-persistence-provider';

interface CartProviderProps {
  children: React.ReactNode;
  enableSync?: boolean;
  syncInterval?: number;
}

function CartProviderInner({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useCartPersistence();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure the cart store is hydrated from localStorage
    if (isInitialized) {
      setIsHydrated(true);
    }
  }, [isInitialized]);

  // Prevent hydration mismatch by not rendering until client-side hydration is complete
  if (!isHydrated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function CartProvider({
  children,
  enableSync = true,
  syncInterval = 30000,
}: CartProviderProps) {
  return (
    <CartPersistenceProvider
      enableSync={enableSync}
      syncInterval={syncInterval}
    >
      <CartProviderInner>{children}</CartProviderInner>
    </CartPersistenceProvider>
  );
}

// Hook to safely use cart store with SSR
export function useCartSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Subscribe to all cart store state to ensure re-renders
  const items = useCartStore(state => state.items);
  const isOpen = useCartStore(state => state.isOpen);
  const lastSyncTimestamp = useCartStore(state => state.lastSyncTimestamp);
  const storeIsHydrated = useCartStore(state => state.isHydrated);

  // Get all the methods
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const updateCustomizations = useCartStore(
    state => state.updateCustomizations
  );
  const clearCart = useCartStore(state => state.clearCart);
  const toggleCart = useCartStore(state => state.toggleCart);
  const openCart = useCartStore(state => state.openCart);
  const closeCart = useCartStore(state => state.closeCart);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const getSubtotal = useCartStore(state => state.getSubtotal);
  const getTax = useCartStore(state => state.getTax);
  const getDeliveryFee = useCartStore(state => state.getDeliveryFee);
  const getTotal = useCartStore(state => state.getTotal);
  const hasItems = useCartStore(state => state.hasItems);
  const getItemById = useCartStore(state => state.getItemById);
  const syncCart = useCartStore(state => state.syncCart);
  const setHydrated = useCartStore(state => state.setHydrated);
  const validateCartItems = useCartStore(state => state.validateCartItems);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return safe defaults during SSR
  if (!isHydrated) {
    return {
      items: [],
      isOpen: false,
      lastSyncTimestamp: 0,
      isHydrated: false,
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      updateCustomizations: () => {},
      clearCart: () => {},
      toggleCart: () => {},
      openCart: () => {},
      closeCart: () => {},
      getTotalItems: () => 0,
      getSubtotal: () => 0,
      getTax: () => 0,
      getDeliveryFee: () => 0,
      getTotal: () => 0,
      hasItems: () => false,
      getItemById: () => undefined,
      syncCart: async () => {},
      setHydrated: () => {},
      validateCartItems: () => {},
    };
  }

  return {
    items,
    isOpen,
    lastSyncTimestamp,
    isHydrated: storeIsHydrated,
    addItem,
    removeItem,
    updateQuantity,
    updateCustomizations,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getTotalItems,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getTotal,
    hasItems,
    getItemById,
    syncCart,
    setHydrated,
    validateCartItems,
  };
}
