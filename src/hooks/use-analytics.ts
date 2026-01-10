'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  trackPageView,
  trackCustomizationSelection,
  trackCartConversion,
  trackUserBehavior,
  initializeAnalytics,
  type CustomizationEvent,
  type CartConversionEvent,
  type UserBehaviorEvent,
} from '@/lib/analytics';
import type { MenuItem, Package, SelectedCustomization } from '@/types';

/**
 * Hook for tracking page views automatically
 */
export function usePageViewTracking() {
  const pathname = usePathname();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Initialize analytics on first load
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Only track if pathname actually changed
    if (previousPathname.current !== pathname) {
      const pageData = {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname,
        content_group1: getContentGroup1(pathname),
        content_group2: getContentGroup2(pathname),
      };

      trackPageView(pageData);
      previousPathname.current = pathname;
    }
  }, [pathname]);
}

/**
 * Hook for tracking customization selections
 */
export function useCustomizationTracking(item: MenuItem | Package) {
  const trackCustomization = useCallback(
    (
      customizationName: string,
      customizationType: 'radio' | 'checkbox' | 'text',
      selectedOption?: string,
      priceModifier: number = 0,
      totalCustomizations: number = 0
    ) => {
      const data: CustomizationEvent = {
        item_id: item.id,
        item_name: item.name,
        item_category: getItemCategory(item),
        customization_type: customizationType,
        customization_name: customizationName,
        selected_option: selectedOption,
        price_modifier: priceModifier,
        total_customizations: totalCustomizations,
      };

      trackCustomizationSelection(data);
    },
    [item]
  );

  return { trackCustomization };
}

/**
 * Hook for tracking cart conversions
 */
export function useCartTracking() {
  const trackAddToCart = useCallback(
    (
      item: MenuItem | Package,
      quantity: number,
      unitPrice: number,
      totalPrice: number,
      selectedCustomizations: SelectedCustomization[] = [],
      hasSpecialInstructions: boolean = false,
      conversionSource:
        | 'detail_page'
        | 'quick_add'
        | 'related_items' = 'detail_page'
    ) => {
      const data: CartConversionEvent = {
        item_id: item.id,
        item_name: item.name,
        item_category: getItemCategory(item),
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        customizations_count: selectedCustomizations.length,
        has_special_instructions: hasSpecialInstructions,
        conversion_source: conversionSource,
      };

      trackCartConversion(data);
    },
    []
  );

  return { trackAddToCart };
}

/**
 * Hook for tracking user engagement and behavior
 */
export function useUserBehaviorTracking() {
  const pathname = usePathname();
  const engagementStartTime = useRef<number>(Date.now());
  const hasTrackedEngagement = useRef<boolean>(false);

  // Reset engagement tracking when pathname changes
  useEffect(() => {
    engagementStartTime.current = Date.now();
    hasTrackedEngagement.current = false;
  }, [pathname]);

  const trackEngagement = useCallback(
    (scrollDepth?: number) => {
      if (hasTrackedEngagement.current) return;

      const engagementTime = Date.now() - engagementStartTime.current;

      // Only track if user has been engaged for at least 10 seconds
      if (engagementTime >= 10000) {
        const data: UserBehaviorEvent = {
          event_type: 'engagement',
          page_path: pathname,
          engagement_time: engagementTime,
          scroll_depth: scrollDepth,
        };

        trackUserBehavior(data);
        hasTrackedEngagement.current = true;
      }
    },
    [pathname]
  );

  const trackExitPoint = useCallback(
    (exitElement?: string, scrollDepth?: number) => {
      const engagementTime = Date.now() - engagementStartTime.current;

      const data: UserBehaviorEvent = {
        event_type: 'exit_point',
        page_path: pathname,
        engagement_time: engagementTime,
        scroll_depth: scrollDepth,
        exit_element: exitElement,
      };

      trackUserBehavior(data);
    },
    [pathname]
  );

  const trackPerformance = useCallback(
    (metric: string, value: number) => {
      const data: UserBehaviorEvent = {
        event_type: 'performance',
        page_path: pathname,
        performance_metric: metric,
        performance_value: value,
      };

      trackUserBehavior(data);
    },
    [pathname]
  );

  return {
    trackEngagement,
    trackExitPoint,
    trackPerformance,
  };
}

/**
 * Hook for tracking element interactions
 */
export function useInteractionTracking() {
  const pathname = usePathname();

  const trackElementClick = useCallback(
    (elementType: string, elementId?: string, elementText?: string) => {
      const data: UserBehaviorEvent = {
        event_type: 'engagement',
        page_path: pathname,
        exit_element: `${elementType}${elementId ? `#${elementId}` : ''}${elementText ? `:${elementText}` : ''}`,
      };

      trackUserBehavior(data);
    },
    [pathname]
  );

  const trackFormInteraction = useCallback(
    (
      formType: string,
      action: 'start' | 'complete' | 'abandon',
      fieldCount?: number
    ) => {
      const data: UserBehaviorEvent = {
        event_type: 'engagement',
        page_path: pathname,
        exit_element: `form:${formType}:${action}${fieldCount ? `:${fieldCount}` : ''}`,
      };

      trackUserBehavior(data);
    },
    [pathname]
  );

  return {
    trackElementClick,
    trackFormInteraction,
  };
}

/**
 * Hook for comprehensive analytics tracking on detail pages
 */
export function useDetailPageAnalytics(item: MenuItem | Package) {
  const { trackCustomization } = useCustomizationTracking(item);
  const { trackAddToCart } = useCartTracking();
  const { trackEngagement, trackExitPoint } = useUserBehaviorTracking();
  const { trackElementClick } = useInteractionTracking();

  // Track page engagement after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      trackEngagement();
    }, 30000);

    return () => clearTimeout(timer);
  }, [trackEngagement]);

  // Track scroll engagement
  useEffect(() => {
    let maxScrollDepth = 0;
    let engagementTracked = false;

    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;

        // Track engagement when user scrolls past 50%
        if (scrollDepth >= 50 && !engagementTracked) {
          trackEngagement(scrollDepth);
          engagementTracked = true;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackEngagement]);

  return {
    trackCustomization,
    trackAddToCart,
    trackEngagement,
    trackExitPoint,
    trackElementClick,
  };
}

// Helper functions
function getContentGroup1(pathname: string): string {
  if (pathname.startsWith('/menu')) return 'menu';
  if (pathname.startsWith('/packages')) return 'packages';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/checkout')) return 'checkout';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/auth')) return 'auth';
  return 'other';
}

function getContentGroup2(pathname: string): string | undefined {
  if (pathname.includes('/items/')) return 'item_detail';
  if (pathname.includes('/packages/')) return 'package_detail';
  if (pathname === '/menu') return 'menu_browse';
  if (pathname === '/packages') return 'packages_browse';
  return undefined;
}

function getItemCategory(item: MenuItem | Package): string {
  if ('basePrice' in item) {
    // MenuItem
    return item.category?.name || 'unknown';
  } else {
    // Package
    return item.type || 'package';
  }
}
