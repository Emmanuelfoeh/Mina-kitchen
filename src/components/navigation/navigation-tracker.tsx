'use client';

import { useEffect } from 'react';
import { initializeNavigation } from '@/lib/navigation';

export function NavigationTracker() {
  useEffect(() => {
    initializeNavigation();
  }, []);

  return null;
}
