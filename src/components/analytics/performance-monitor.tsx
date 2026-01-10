'use client';

import { useEffect, useRef } from 'react';
import { useUserBehaviorTracking } from '@/hooks/use-analytics';

/**
 * Performance monitoring component that tracks Core Web Vitals
 * and other performance metrics for analytics
 */
export function PerformanceMonitor() {
  const { trackPerformance } = useUserBehaviorTracking();
  const metricsTracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Track Core Web Vitals using PerformanceObserver
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Track Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];

          if (lastEntry && !metricsTracked.current.has('LCP')) {
            trackPerformance('LCP', lastEntry.startTime);
            metricsTracked.current.add('LCP');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP tracking not supported:', error);
      }

      // Track First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!metricsTracked.current.has('FID')) {
              const fid = entry.processingStart - entry.startTime;
              trackPerformance('FID', fid);
              metricsTracked.current.add('FID');
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID tracking not supported:', error);
      }

      // Track Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          // Track CLS periodically
          if (!metricsTracked.current.has('CLS')) {
            setTimeout(() => {
              trackPerformance('CLS', clsValue * 1000); // Convert to milliseconds for consistency
              metricsTracked.current.add('CLS');
            }, 5000); // Wait 5 seconds for layout to stabilize
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS tracking not supported:', error);
      }

      // Track Time to First Byte (TTFB)
      try {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation && !metricsTracked.current.has('TTFB')) {
          const ttfb = navigation.responseStart - navigation.requestStart;
          trackPerformance('TTFB', ttfb);
          metricsTracked.current.add('TTFB');
        }
      } catch (error) {
        console.warn('TTFB tracking not supported:', error);
      }

      // Track First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (
              entry.name === 'first-contentful-paint' &&
              !metricsTracked.current.has('FCP')
            ) {
              trackPerformance('FCP', entry.startTime);
              metricsTracked.current.add('FCP');
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('FCP tracking not supported:', error);
      }
    }

    // Track resource loading performance
    const trackResourcePerformance = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const resources = performance.getEntriesByType(
          'resource'
        ) as PerformanceResourceTiming[];

        // Track image loading performance
        const imageResources = resources.filter(resource =>
          resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        );

        if (
          imageResources.length > 0 &&
          !metricsTracked.current.has('image_load_avg')
        ) {
          const avgImageLoadTime =
            imageResources.reduce(
              (sum, resource) =>
                sum + (resource.responseEnd - resource.requestStart),
              0
            ) / imageResources.length;

          trackPerformance('image_load_avg', avgImageLoadTime);
          trackPerformance('image_count', imageResources.length);
          metricsTracked.current.add('image_load_avg');
        }

        // Track JavaScript bundle performance
        const jsResources = resources.filter(resource =>
          resource.name.match(/\.js$/i)
        );

        if (
          jsResources.length > 0 &&
          !metricsTracked.current.has('js_load_avg')
        ) {
          const avgJsLoadTime =
            jsResources.reduce(
              (sum, resource) =>
                sum + (resource.responseEnd - resource.requestStart),
              0
            ) / jsResources.length;

          trackPerformance('js_load_avg', avgJsLoadTime);
          trackPerformance('js_bundle_count', jsResources.length);
          metricsTracked.current.add('js_load_avg');
        }

        // Track CSS loading performance
        const cssResources = resources.filter(resource =>
          resource.name.match(/\.css$/i)
        );

        if (
          cssResources.length > 0 &&
          !metricsTracked.current.has('css_load_avg')
        ) {
          const avgCssLoadTime =
            cssResources.reduce(
              (sum, resource) =>
                sum + (resource.responseEnd - resource.requestStart),
              0
            ) / cssResources.length;

          trackPerformance('css_load_avg', avgCssLoadTime);
          trackPerformance('css_count', cssResources.length);
          metricsTracked.current.add('css_load_avg');
        }
      }
    };

    // Track resource performance after page load
    const resourceTimer = setTimeout(trackResourcePerformance, 3000);

    // Track device and connection information
    const trackDeviceInfo = () => {
      if (
        typeof window !== 'undefined' &&
        !metricsTracked.current.has('device_info')
      ) {
        // Track viewport size
        trackPerformance('viewport_width', window.innerWidth);
        trackPerformance('viewport_height', window.innerHeight);

        // Track device pixel ratio
        trackPerformance('device_pixel_ratio', window.devicePixelRatio || 1);

        // Track connection information (if available)
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          if (connection) {
            trackPerformance('connection_downlink', connection.downlink || 0);
            trackPerformance('connection_rtt', connection.rtt || 0);

            // Track connection type
            if (connection.effectiveType) {
              const connectionTypeMap: Record<string, number> = {
                'slow-2g': 1,
                '2g': 2,
                '3g': 3,
                '4g': 4,
              };
              trackPerformance(
                'connection_type',
                connectionTypeMap[connection.effectiveType] || 0
              );
            }
          }
        }

        // Track memory information (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          trackPerformance('memory_limit', memory.jsHeapSizeLimit);
          trackPerformance('memory_used', memory.usedJSHeapSize);
          trackPerformance('memory_total', memory.totalJSHeapSize);
        }

        metricsTracked.current.add('device_info');
      }
    };

    trackDeviceInfo();

    return () => {
      clearTimeout(resourceTimer);
    };
  }, [trackPerformance]);

  // Track frame rate (FPS) for smooth interactions
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = (currentTime: number) => {
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        // Measure every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        if (!metricsTracked.current.has('fps_measured')) {
          trackPerformance('fps_avg', fps);
          metricsTracked.current.add('fps_measured');
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      // Only measure for the first 10 seconds to avoid continuous tracking
      if (currentTime - performance.now() < 10000) {
        animationId = requestAnimationFrame(measureFPS);
      }
    };

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      animationId = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [trackPerformance]);

  return null; // This component doesn't render anything
}
