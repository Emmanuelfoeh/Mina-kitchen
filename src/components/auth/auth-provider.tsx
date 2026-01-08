'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/user-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useUserStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
