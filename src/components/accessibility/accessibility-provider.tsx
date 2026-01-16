'use client';

import { useEffect } from 'react';
import {
  addFocusVisibleSupport,
  createLiveRegion,
  announceToScreenReader,
} from '@/lib/accessibility';

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize focus-visible support
    addFocusVisibleSupport();

    // Create live regions for announcements
    createLiveRegion('announcements', 'polite');
    createLiveRegion('status', 'assertive');

    // Announce page load for screen readers
    announceToScreenReader('Page loaded');

    // Handle reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      document.documentElement.style.setProperty(
        '--animation-duration',
        e.matches ? '0.01ms' : '300ms'
      );
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    handleMotionChange(mediaQuery as any);

    // Handle high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('high-contrast', e.matches);
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    handleContrastChange(contrastQuery as any);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return <>{children}</>;
}
