'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cart-store';

interface UseCartSyncOptions {
  syncInterval?: number; // Sync interval in milliseconds
  enableCrossTabSync?: boolean; // Enable synchronization across browser tabs
  enablePeriodicSync?: boolean; // Enable periodic server synchronization
}

export function useCartSync({
  syncInterval = 30000, // 30 seconds default
  enableCrossTabSync = true,
  enablePeriodicSync = true,
}: UseCartSyncOptions = {}) {
  const { syncCart, isHydrated, lastSyncTimestamp } = useCartStore();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  // Handle cross-tab synchronization using storage events
  useEffect(() => {
    if (!enableCrossTabSync || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      // Only handle cart storage changes
      if (event.key === 'cart-storage' && event.newValue) {
        try {
          const newCartData = JSON.parse(event.newValue);

          // Check if the change is from another tab and is newer
          if (
            newCartData.state?.lastSyncTimestamp &&
            newCartData.state.lastSyncTimestamp > lastSyncRef.current
          ) {
            // Force re-hydration from storage
            window.location.reload();
          }
        } catch (error) {
          console.error('Failed to parse cart storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [enableCrossTabSync]);

  // Handle periodic synchronization
  useEffect(() => {
    if (!enablePeriodicSync || !isHydrated) return;

    const startPeriodicSync = () => {
      syncIntervalRef.current = setInterval(async () => {
        try {
          await syncCart();
          lastSyncRef.current = Date.now();
        } catch (error) {
          console.error('Periodic cart sync failed:', error);
        }
      }, syncInterval);
    };

    // Start periodic sync
    startPeriodicSync();

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isHydrated, enablePeriodicSync, syncInterval, syncCart]);

  // Update last sync reference when timestamp changes
  useEffect(() => {
    lastSyncRef.current = lastSyncTimestamp;
  }, [lastSyncTimestamp]);

  // Handle page visibility changes to sync when tab becomes active
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!document.hidden && isHydrated) {
        // Sync when tab becomes visible
        syncCart();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isHydrated, syncCart]);

  // Handle online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      if (isHydrated) {
        // Sync when coming back online
        syncCart();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isHydrated, syncCart]);

  // Manual sync function
  const manualSync = async () => {
    try {
      await syncCart();
      return { success: true };
    } catch (error) {
      console.error('Manual cart sync failed:', error);
      return { success: false, error };
    }
  };

  return {
    manualSync,
    isHydrated,
    lastSyncTimestamp,
  };
}
