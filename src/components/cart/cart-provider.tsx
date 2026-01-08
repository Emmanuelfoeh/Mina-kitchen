'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores';

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure the cart store is hydrated from localStorage
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side hydration is complete
  if (!isHydrated) {
    return <>{children}</>;
  }

  return <>{children}</>;
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
    };
  }

  return cartStore;
}
