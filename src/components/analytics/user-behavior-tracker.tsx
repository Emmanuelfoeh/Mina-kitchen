'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  useUserBehaviorTracking,
  useInteractionTracking,
} from '@/hooks/use-analytics';

interface UserBehaviorTrackerProps {
  children: React.ReactNode;
}

/**
 * User behavior tracker component that monitors user interactions,
 * engagement metrics, and exit points across the application
 */
export function UserBehaviorTracker({ children }: UserBehaviorTrackerProps) {
  const pathname = usePathname();
  const { trackEngagement, trackExitPoint, trackPerformance } =
    useUserBehaviorTracking();
  const { trackElementClick, trackFormInteraction } = useInteractionTracking();

  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const engagementTracked = useRef<boolean>(false);
  const interactionCount = useRef<number>(0);
  const lastActivityTime = useRef<number>(Date.now());

  // Reset tracking state when pathname changes
  useEffect(() => {
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
    engagementTracked.current = false;
    interactionCount.current = 0;
    lastActivityTime.current = Date.now();
  }, [pathname]);

  // Track scroll depth and engagement
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth =
        documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0;

      if (scrollDepth > maxScrollDepth.current) {
        maxScrollDepth.current = scrollDepth;

        // Track milestone scroll depths
        if (scrollDepth >= 25 && scrollDepth % 25 === 0) {
          trackEngagement(scrollDepth);
        }

        // Track deep engagement (75%+ scroll)
        if (scrollDepth >= 75 && !engagementTracked.current) {
          engagementTracked.current = true;
          const engagementTime = Date.now() - pageStartTime.current;
          trackEngagement(scrollDepth);
        }
      }

      lastActivityTime.current = Date.now();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEngagement]);

  // Track user interactions (clicks, form interactions)
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      interactionCount.current += 1;
      lastActivityTime.current = Date.now();

      // Track specific element types
      const tagName = target.tagName.toLowerCase();
      const elementId = target.id;
      const elementText = target.textContent?.slice(0, 50) || '';
      const elementClass = target.className;

      // Track button clicks
      if (tagName === 'button' || target.closest('button')) {
        const button = tagName === 'button' ? target : target.closest('button');
        const buttonText = button?.textContent?.trim() || '';
        trackElementClick('button', button?.id, buttonText);
      }

      // Track link clicks
      if (tagName === 'a' || target.closest('a')) {
        const link = tagName === 'a' ? target : target.closest('a');
        const href = (link as HTMLAnchorElement)?.href || '';
        trackElementClick('link', link?.id, href);
      }

      // Track form element interactions
      if (['input', 'select', 'textarea'].includes(tagName)) {
        const form = target.closest('form');
        const formType = form?.getAttribute('data-form-type') || 'unknown';
        trackFormInteraction(formType, 'start');
      }

      // Track customization interactions
      if (
        elementClass.includes('customization') ||
        target.closest('[data-customization]')
      ) {
        trackElementClick('customization', elementId, elementText);
      }

      // Track cart interactions
      if (elementClass.includes('cart') || target.closest('[data-cart]')) {
        trackElementClick('cart', elementId, elementText);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Track keyboard navigation
      if (
        [
          'Tab',
          'Enter',
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(event.key)
      ) {
        lastActivityTime.current = Date.now();
        interactionCount.current += 1;
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [trackElementClick, trackFormInteraction]);

  // Track form submissions
  useEffect(() => {
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formType = form.getAttribute('data-form-type') || 'unknown';
      const fieldCount = form.querySelectorAll(
        'input, select, textarea'
      ).length;

      trackFormInteraction(formType, 'complete', fieldCount);
      lastActivityTime.current = Date.now();
    };

    document.addEventListener('submit', handleFormSubmit);
    return () => document.removeEventListener('submit', handleFormSubmit);
  }, [trackFormInteraction]);

  // Track page visibility changes (tab switching, minimizing)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const engagementTime = Date.now() - pageStartTime.current;
        trackExitPoint('visibility_change', maxScrollDepth.current);
      } else {
        // User returned to the page
        lastActivityTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackExitPoint]);

  // Track page unload (user leaving the page)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const engagementTime = Date.now() - pageStartTime.current;
      const inactiveTime = Date.now() - lastActivityTime.current;

      trackExitPoint('page_unload', maxScrollDepth.current);

      // Track session summary
      trackEngagement(maxScrollDepth.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackExitPoint, trackEngagement]);

  // Track idle time (user inactivity)
  useEffect(() => {
    const checkIdleTime = () => {
      const idleTime = Date.now() - lastActivityTime.current;
      const idleThreshold = 30000; // 30 seconds

      if (idleTime > idleThreshold && interactionCount.current > 0) {
        trackExitPoint('idle_timeout', maxScrollDepth.current);
      }
    };

    const idleTimer = setInterval(checkIdleTime, 10000); // Check every 10 seconds
    return () => clearInterval(idleTimer);
  }, [trackExitPoint]);

  // Track performance metrics periodically
  useEffect(() => {
    const trackPerformanceMetrics = () => {
      if (typeof window !== 'undefined' && window.performance) {
        // Track memory usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          trackPerformance('memory_used', memory.usedJSHeapSize);
          trackPerformance('memory_total', memory.totalJSHeapSize);
        }

        // Track connection information (if available)
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          if (connection) {
            trackPerformance('connection_downlink', connection.downlink);
            trackPerformance('connection_rtt', connection.rtt);
          }
        }

        // Track page load performance
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          trackPerformance(
            'dom_content_loaded',
            navigation.domContentLoadedEventEnd - navigation.fetchStart
          );
          trackPerformance(
            'load_complete',
            navigation.loadEventEnd - navigation.fetchStart
          );
        }
      }
    };

    // Track performance after page load
    const performanceTimer = setTimeout(trackPerformanceMetrics, 2000);
    return () => clearTimeout(performanceTimer);
  }, [trackPerformance, pathname]);

  return <>{children}</>;
}
