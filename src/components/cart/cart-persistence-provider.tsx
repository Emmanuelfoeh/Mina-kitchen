'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useCartSync } from '@/hooks/use-cart-sync';

interface CartPersistenceContextType {
  isInitialized: boolean;
  hasError: boolean;
  errorMessage: string | null;
  retryInitialization: () => void;
  clearError: () => void;
}

const CartPersistenceContext = createContext<CartPersistenceContextType | null>(
  null
);

interface CartPersistenceProviderProps {
  children: React.ReactNode;
  enableSync?: boolean;
  syncInterval?: number;
}

export function CartPersistenceProvider({
  children,
  enableSync = true,
  syncInterval = 30000,
}: CartPersistenceProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isHydrated, validateCartItems } = useCartStore();
  const { manualSync } = useCartSync({
    enableCrossTabSync: enableSync,
    enablePeriodicSync: enableSync,
    syncInterval,
  });

  // Initialize cart persistence
  useEffect(() => {
    const initializeCart = async () => {
      try {
        setHasError(false);
        setErrorMessage(null);

        // Wait for hydration to complete
        if (!isHydrated) return;

        // Validate cart items after hydration
        validateCartItems();

        // Perform initial sync if enabled
        if (enableSync) {
          const syncResult = await manualSync();
          if (!syncResult.success) {
            console.warn(
              'Initial cart sync failed, continuing with local data'
            );
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Cart initialization failed:', error);
        setHasError(true);
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to initialize cart'
        );
      }
    };

    initializeCart();
  }, [isHydrated, enableSync, validateCartItems, manualSync]);

  // Handle storage quota exceeded errors
  useEffect(() => {
    const handleStorageError = (event: Event) => {
      if (
        event instanceof ErrorEvent &&
        event.message.includes('QuotaExceededError')
      ) {
        setHasError(true);
        setErrorMessage(
          'Storage quota exceeded. Please clear some browser data.'
        );
      }
    };

    window.addEventListener('error', handleStorageError);
    return () => window.removeEventListener('error', handleStorageError);
  }, []);

  const retryInitialization = () => {
    setIsInitialized(false);
    setHasError(false);
    setErrorMessage(null);

    // Trigger re-initialization
    validateCartItems();
  };

  const clearError = () => {
    setHasError(false);
    setErrorMessage(null);
  };

  const contextValue: CartPersistenceContextType = {
    isInitialized,
    hasError,
    errorMessage,
    retryInitialization,
    clearError,
  };

  return (
    <CartPersistenceContext.Provider value={contextValue}>
      {children}
    </CartPersistenceContext.Provider>
  );
}

export function useCartPersistence() {
  const context = useContext(CartPersistenceContext);
  if (!context) {
    throw new Error(
      'useCartPersistence must be used within a CartPersistenceProvider'
    );
  }
  return context;
}

// Error boundary component for cart persistence errors
export function CartPersistenceErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}) {
  const { hasError, errorMessage, retryInitialization } = useCartPersistence();

  if (hasError) {
    if (fallback) {
      const FallbackComponent = fallback;
      return (
        <FallbackComponent
          error={new Error(errorMessage || 'Cart persistence error')}
          retry={retryInitialization}
        />
      );
    }

    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Cart Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                {errorMessage || 'An error occurred with cart persistence.'}
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
                onClick={retryInitialization}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
