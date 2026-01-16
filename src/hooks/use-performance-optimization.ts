import { useEffect, useCallback, useRef, useMemo } from 'react';
import {
  PerformanceMonitor,
  CodeSplittingOptimizer,
  MemoryMonitor,
  optimizationUtils,
} from '@/lib/performance';

/**
 * Hook for component-level performance optimization
 */
export function usePerformanceOptimization(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const componentLifetime = unmountTime - mountTime.current;
      PerformanceMonitor.recordMetric(
        `${componentName}_Lifetime`,
        componentLifetime
      );
    };
  }, [componentName]);

  const measureRender = useCallback(
    <T>(renderFn: () => T): T => {
      renderStartTime.current = performance.now();
      const result = renderFn();
      const renderTime = performance.now() - renderStartTime.current;

      PerformanceMonitor.recordMetric(`${componentName}_Render`, renderTime);

      if (renderTime > 16) {
        // More than one frame at 60fps
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }

      return result;
    },
    [componentName]
  );

  const measureAsync = useCallback(
    async <T>(asyncFn: () => Promise<T>, operationName: string): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await asyncFn();
        const duration = performance.now() - startTime;
        PerformanceMonitor.recordMetric(
          `${componentName}_${operationName}`,
          duration
        );
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        PerformanceMonitor.recordMetric(
          `${componentName}_${operationName}_Error`,
          duration
        );
        throw error;
      }
    },
    [componentName]
  );

  return {
    measureRender,
    measureAsync,
  };
}

/**
 * Hook for lazy loading components with performance monitoring
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) {
  return useMemo(() => {
    return CodeSplittingOptimizer.createLazyComponent(importFn);
  }, [importFn]);
}

/**
 * Hook for preloading routes based on user interaction
 */
export function useRoutePreloading() {
  const preloadedRoutes = useRef<Set<string>>(new Set());

  const preloadRoute = useCallback((route: string) => {
    if (!preloadedRoutes.current.has(route)) {
      CodeSplittingOptimizer.preloadRoute(route);
      preloadedRoutes.current.add(route);
    }
  }, []);

  const preloadOnHover = useCallback(
    (route: string) => {
      return {
        onMouseEnter: () => preloadRoute(route),
        onFocus: () => preloadRoute(route),
      };
    },
    [preloadRoute]
  );

  return {
    preloadRoute,
    preloadOnHover,
  };
}

/**
 * Hook for monitoring memory usage in components
 */
export function useMemoryMonitoring(
  componentName: string,
  intervalMs: number = 30000
) {
  useEffect(() => {
    const cleanup = MemoryMonitor.startMemoryMonitoring(intervalMs);

    // Log initial memory usage
    const initialMemory = MemoryMonitor.getMemoryUsage();
    if (initialMemory.percentage) {
      PerformanceMonitor.recordMetric(
        `${componentName}_Initial_Memory`,
        initialMemory.percentage
      );
    }

    return cleanup;
  }, [componentName, intervalMs]);

  const getMemoryUsage = useCallback(() => {
    return MemoryMonitor.getMemoryUsage();
  }, []);

  return { getMemoryUsage };
}

/**
 * Hook for debounced and throttled functions
 */
export function useOptimizedCallbacks() {
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(func: T, wait: number) => {
      return optimizationUtils.debounce(func, wait);
    },
    []
  );

  const throttle = useCallback(
    <T extends (...args: any[]) => any>(func: T, limit: number) => {
      return optimizationUtils.throttle(func, limit);
    },
    []
  );

  return { debounce, throttle };
}

/**
 * Hook for adaptive loading based on device capabilities
 */
export function useAdaptiveLoading() {
  const deviceCapabilities = useMemo(
    () => ({
      isSlowConnection: optimizationUtils.isSlowConnection(),
      deviceMemory: optimizationUtils.getDeviceMemory(),
      shouldLoadHighQuality: optimizationUtils.shouldLoadHighQuality(),
    }),
    []
  );

  const getOptimalImageQuality = useCallback(() => {
    if (deviceCapabilities.isSlowConnection) return 60;
    if (deviceCapabilities.deviceMemory < 4) return 70;
    return 85;
  }, [deviceCapabilities]);

  const shouldPreloadImages = useCallback(() => {
    return (
      !deviceCapabilities.isSlowConnection &&
      deviceCapabilities.deviceMemory >= 4
    );
  }, [deviceCapabilities]);

  const getOptimalChunkSize = useCallback(() => {
    if (deviceCapabilities.isSlowConnection) return 5;
    if (deviceCapabilities.deviceMemory < 4) return 10;
    return 20;
  }, [deviceCapabilities]);

  return {
    deviceCapabilities,
    getOptimalImageQuality,
    shouldPreloadImages,
    getOptimalChunkSize,
  };
}

/**
 * Hook for intersection observer with performance optimization
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  const observe = useCallback(
    (element: Element) => {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(callback, {
          threshold: 0.1,
          rootMargin: '50px',
          ...options,
        });
      }

      observerRef.current.observe(element);
      elementsRef.current.add(element);
    },
    [callback, options]
  );

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      elementsRef.current.clear();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { observe, unobserve, disconnect };
}

/**
 * Hook for performance monitoring dashboard
 */
export function usePerformanceDashboard() {
  const getMetrics = useCallback(() => {
    return PerformanceMonitor.getPerformanceSummary();
  }, []);

  const getDetailedMetrics = useCallback(() => {
    return PerformanceMonitor.getMetrics();
  }, []);

  const clearMetrics = useCallback(() => {
    PerformanceMonitor.cleanup();
  }, []);

  return {
    getMetrics,
    getDetailedMetrics,
    clearMetrics,
  };
}

/**
 * Hook for critical resource preloading
 */
export function useCriticalResourcePreloading() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadCriticalResources = useCallback((resources: string[]) => {
    resources.forEach(resource => {
      if (!preloadedResources.current.has(resource)) {
        optimizationUtils.preloadResource(resource);
        preloadedResources.current.add(resource);
      }
    });
  }, []);

  const preloadFont = useCallback((fontUrl: string) => {
    if (!preloadedResources.current.has(fontUrl)) {
      optimizationUtils.preloadResource(fontUrl, 'font');
      preloadedResources.current.add(fontUrl);
    }
  }, []);

  const preloadStylesheet = useCallback((cssUrl: string) => {
    if (!preloadedResources.current.has(cssUrl)) {
      optimizationUtils.preloadResource(cssUrl, 'style');
      preloadedResources.current.add(cssUrl);
    }
  }, []);

  return {
    preloadCriticalResources,
    preloadFont,
    preloadStylesheet,
  };
}

/**
 * Hook for component error boundary with performance tracking
 */
export function useErrorBoundaryPerformance(componentName: string) {
  const errorCount = useRef<number>(0);

  const trackError = useCallback(
    (error: Error, errorInfo?: any) => {
      errorCount.current += 1;

      PerformanceMonitor.recordMetric(
        `${componentName}_Error_Count`,
        errorCount.current
      );
      PerformanceMonitor.recordMetric(
        `${componentName}_Error_Timestamp`,
        Date.now()
      );

      console.error(`Error in ${componentName}:`, error, errorInfo);
    },
    [componentName]
  );

  const getErrorStats = useCallback(
    () => ({
      errorCount: errorCount.current,
      componentName,
    }),
    [componentName]
  );

  return {
    trackError,
    getErrorStats,
  };
}
