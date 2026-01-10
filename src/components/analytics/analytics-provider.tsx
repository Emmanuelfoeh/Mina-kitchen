'use client';

import { useEffect } from 'react';
import { usePageViewTracking } from '@/hooks/use-analytics';
import { initializeAnalytics } from '@/lib/analytics';
import { UserBehaviorTracker } from './user-behavior-tracker';
import { PerformanceMonitor } from './performance-monitor';
import { EngagementTracker } from './engagement-tracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics provider component that initializes analytics tracking
 * and provides automatic page view tracking for the entire application
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize analytics and track page views automatically
  usePageViewTracking();

  // Initialize analytics on mount
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <UserBehaviorTracker>
      <PerformanceMonitor />
      <EngagementTracker />
      {children}
    </UserBehaviorTracker>
  );
}

/**
 * Analytics script component for loading external analytics scripts
 * This should be included in the document head
 */
export function AnalyticsScript() {
  const trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  if (!trackingId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
}
