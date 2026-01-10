'use client';

import { useEffect, useState } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export function useMobileViewport(): ViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  });

  useEffect(() => {
    const updateViewportInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const orientation = width > height ? 'landscape' : 'portrait';

      // Get safe area insets from CSS environment variables
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaInsets = {
        top: parseInt(
          computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'
        ),
        right: parseInt(
          computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'
        ),
        bottom: parseInt(
          computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'
        ),
        left: parseInt(
          computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'
        ),
      };

      setViewportInfo({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        safeAreaInsets,
      });
    };

    // Initial update
    updateViewportInfo();

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateViewportInfo);
    window.addEventListener('orientationchange', updateViewportInfo);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewportInfo);
      window.removeEventListener('orientationchange', updateViewportInfo);
    };
  }, []);

  return viewportInfo;
}

// Hook for detecting if user is on a touch device
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouchScreen =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;
      setIsTouchDevice(hasTouchScreen);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
}

// Hook for detecting mobile browser features
export function useMobileFeatures() {
  const [features, setFeatures] = useState({
    supportsTouch: false,
    supportsHover: false,
    prefersReducedMotion: false,
    isStandalone: false, // PWA mode
  });

  useEffect(() => {
    const checkFeatures = () => {
      const supportsTouch = 'ontouchstart' in window;
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      setFeatures({
        supportsTouch,
        supportsHover,
        prefersReducedMotion,
        isStandalone,
      });
    };

    checkFeatures();

    // Listen for changes
    const hoverQuery = window.matchMedia('(hover: hover)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');

    hoverQuery.addEventListener('change', checkFeatures);
    motionQuery.addEventListener('change', checkFeatures);
    standaloneQuery.addEventListener('change', checkFeatures);

    return () => {
      hoverQuery.removeEventListener('change', checkFeatures);
      motionQuery.removeEventListener('change', checkFeatures);
      standaloneQuery.removeEventListener('change', checkFeatures);
    };
  }, []);

  return features;
}
