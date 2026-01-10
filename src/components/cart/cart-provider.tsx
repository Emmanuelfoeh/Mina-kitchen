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
  const cartStore = useCartStore();

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

  return cartStore;
}
