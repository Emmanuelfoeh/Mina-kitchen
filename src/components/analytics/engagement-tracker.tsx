'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUserBehaviorTracking } from '@/hooks/use-analytics';

interface EngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  interactionCount: number;
  focusTime: number;
  idleTime: number;
}

/**
 * Engagement tracker component that monitors detailed user engagement metrics
 * including time on page, scroll behavior, interactions, and attention patterns
 */
export function EngagementTracker() {
  const pathname = usePathname();
  const { trackEngagement, trackExitPoint } = useUserBehaviorTracking();

  const [metrics, setMetrics] = useState<EngagementMetrics>({
    timeOnPage: 0,
    scrollDepth: 0,
    interactionCount: 0,
    focusTime: 0,
    idleTime: 0,
  });

  const pageStartTime = useRef<number>(Date.now());
  const lastActivityTime = useRef<number>(Date.now());
  const focusStartTime = useRef<number>(Date.now());
  const totalFocusTime = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const engagementMilestones = useRef<Set<string>>(new Set());

  // Reset metrics when pathname changes
  useEffect(() => {
    pageStartTime.current = Date.now();
    lastActivityTime.current = Date.now();
    focusStartTime.current = Date.now();
    totalFocusTime.current = 0;
    maxScrollDepth.current = 0;
    interactionCount.current = 0;
    engagementMilestones.current.clear();

    setMetrics({
      timeOnPage: 0,
      scrollDepth: 0,
      interactionCount: 0,
      focusTime: 0,
      idleTime: 0,
    });
  }, [pathname]);

  // Track page focus/blur for attention metrics
  useEffect(() => {
    const handleFocus = () => {
      focusStartTime.current = Date.now();
      lastActivityTime.current = Date.now();
    };

    const handleBlur = () => {
      if (focusStartTime.current) {
        totalFocusTime.current += Date.now() - focusStartTime.current;
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Track scroll depth and patterns
  useEffect(() => {
    let scrollDirection = 'down';
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollStartTime = Date.now();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth =
        documentHeight > 0
          ? Math.round((currentScrollY / documentHeight) * 100)
          : 0;

      // Update max scroll depth
      if (scrollDepth > maxScrollDepth.current) {
        maxScrollDepth.current = scrollDepth;
      }

      // Track scroll direction and velocity
      const newDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      if (newDirection !== scrollDirection) {
        scrollDirection = newDirection;
      }

      const timeDiff = Date.now() - scrollStartTime;
      if (timeDiff > 0) {
        scrollVelocity = Math.abs(currentScrollY - lastScrollY) / timeDiff;
      }

      lastScrollY = currentScrollY;
      scrollStartTime = Date.now();
      lastActivityTime.current = Date.now();

      // Track engagement milestones
      const milestones = [10, 25, 50, 75, 90];
      milestones.forEach(milestone => {
        if (
          scrollDepth >= milestone &&
          !engagementMilestones.current.has(`scroll_${milestone}`)
        ) {
          engagementMilestones.current.add(`scroll_${milestone}`);
          trackEngagement(scrollDepth);
        }
      });

      // Track rapid scrolling (potential bounce behavior)
      if (
        scrollVelocity > 5 &&
        !engagementMilestones.current.has('rapid_scroll')
      ) {
        engagementMilestones.current.add('rapid_scroll');
        trackExitPoint('rapid_scroll', scrollDepth);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEngagement, trackExitPoint]);

  // Track user interactions
  useEffect(() => {
    const trackInteraction = (eventType: string) => {
      interactionCount.current += 1;
      lastActivityTime.current = Date.now();

      // Track interaction milestones
      const interactionMilestones = [1, 5, 10, 20, 50];
      interactionMilestones.forEach(milestone => {
        if (
          interactionCount.current === milestone &&
          !engagementMilestones.current.has(`interaction_${milestone}`)
        ) {
          engagementMilestones.current.add(`interaction_${milestone}`);
          trackEngagement(maxScrollDepth.current);
        }
      });
    };

    const handleClick = () => trackInteraction('click');
    const handleKeyDown = () => trackInteraction('keydown');
    const handleTouchStart = () => trackInteraction('touch');
    const handleMouseMove = () => {
      // Only count significant mouse movements to avoid noise
      const now = Date.now();
      if (now - lastActivityTime.current > 1000) {
        trackInteraction('mousemove');
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [trackEngagement]);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const now = Date.now();
      const timeOnPage = now - pageStartTime.current;
      const idleTime = now - lastActivityTime.current;
      const currentFocusTime = document.hasFocus()
        ? totalFocusTime.current + (now - focusStartTime.current)
        : totalFocusTime.current;

      setMetrics({
        timeOnPage,
        scrollDepth: maxScrollDepth.current,
        interactionCount: interactionCount.current,
        focusTime: currentFocusTime,
        idleTime,
      });

      // Track time-based engagement milestones
      const timeMilestones = [30000, 60000, 120000, 300000]; // 30s, 1m, 2m, 5m
      timeMilestones.forEach(milestone => {
        if (
          timeOnPage >= milestone &&
          !engagementMilestones.current.has(`time_${milestone}`)
        ) {
          engagementMilestones.current.add(`time_${milestone}`);
          trackEngagement(maxScrollDepth.current);
        }
      });

      // Track idle behavior
      if (idleTime > 30000 && !engagementMilestones.current.has('idle_30s')) {
        engagementMilestones.current.add('idle_30s');
        trackExitPoint('idle_timeout', maxScrollDepth.current);
      }
    };

    const metricsInterval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(metricsInterval);
  }, [trackEngagement, trackExitPoint]);

  // Track reading patterns for content pages
  useEffect(() => {
    if (pathname.includes('/items/') || pathname.includes('/packages/')) {
      let readingStartTime: number | null = null;
      let totalReadingTime = 0;

      const trackReadingBehavior = () => {
        const contentElements = document.querySelectorAll(
          'p, h1, h2, h3, h4, h5, h6, li'
        );
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        let visibleTextLength = 0;
        contentElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= viewportHeight) {
            visibleTextLength += element.textContent?.length || 0;
          }
        });

        // Estimate reading time (average 200 words per minute, 5 chars per word)
        const estimatedReadingTime = (visibleTextLength / 5 / 200) * 60 * 1000; // in milliseconds

        if (visibleTextLength > 100) {
          // Significant content visible
          if (!readingStartTime) {
            readingStartTime = Date.now();
          }
        } else {
          if (readingStartTime) {
            totalReadingTime += Date.now() - readingStartTime;
            readingStartTime = null;
          }
        }

        // Track reading engagement
        if (
          totalReadingTime > estimatedReadingTime * 0.5 &&
          !engagementMilestones.current.has('reading_engaged')
        ) {
          engagementMilestones.current.add('reading_engaged');
          trackEngagement(maxScrollDepth.current);
        }
      };

      const readingInterval = setInterval(trackReadingBehavior, 2000);
      return () => clearInterval(readingInterval);
    }
  }, [pathname, trackEngagement]);

  // Track exit intent (mouse leaving viewport)
  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      if (
        event.clientY <= 0 &&
        !engagementMilestones.current.has('exit_intent')
      ) {
        engagementMilestones.current.add('exit_intent');
        trackExitPoint('exit_intent', maxScrollDepth.current);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [trackExitPoint]);

  // Track final engagement summary on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const finalMetrics = {
        timeOnPage: Date.now() - pageStartTime.current,
        scrollDepth: maxScrollDepth.current,
        interactionCount: interactionCount.current,
        focusTime:
          totalFocusTime.current +
          (document.hasFocus() ? Date.now() - focusStartTime.current : 0),
        idleTime: Date.now() - lastActivityTime.current,
      };

      // Calculate engagement score (0-100)
      const engagementScore = Math.min(
        100,
        Math.round(
          finalMetrics.scrollDepth * 0.3 +
            Math.min(finalMetrics.interactionCount * 5, 50) * 0.3 +
            Math.min(finalMetrics.timeOnPage / 1000 / 60, 10) * 4 * 0.2 + // Max 10 minutes
            Math.min(
              (finalMetrics.focusTime / finalMetrics.timeOnPage) * 100,
              100
            ) *
              0.2
        )
      );

      trackEngagement(maxScrollDepth.current);
      trackExitPoint('page_unload', maxScrollDepth.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackEngagement, trackExitPoint]);

  return null; // This component doesn't render anything
}
