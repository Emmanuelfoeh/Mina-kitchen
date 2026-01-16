import * as React from 'react';

/**
 * Performance monitoring and optimization utilities
 */

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100, // First Input Delay
  CLS: 0.1, // Cumulative Layout Shift

  // Custom metrics
  TTI: 3800, // Time to Interactive
  FCP: 1800, // First Contentful Paint
  TTFB: 600, // Time to First Byte

  // API response times
  API_FAST: 200,
  API_SLOW: 1000,

  // Image loading
  IMAGE_FAST: 500,
  IMAGE_SLOW: 2000,
} as const;

/**
 * Enhanced Performance metrics collector
 */
export class PerformanceMonitor {
  private static metrics = new Map<string, number>();
  private static observers = new Map<string, PerformanceObserver>();

  /**
   * Initialize performance monitoring
   */
  static init(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor navigation timing
    this.observeNavigationTiming();

    // Monitor long tasks
    this.observeLongTasks();
  }

  /**
   * Observe Core Web Vitals
   */
  private static observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;

        if (lastEntry) {
          const lcp = lastEntry.startTime;
          this.recordMetric('LCP', lcp);

          if (lcp > PERFORMANCE_THRESHOLDS.LCP) {
            console.warn(
              `Poor LCP detected: ${lcp.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.LCP}ms)`
            );
          }
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric('FID', fid);

          if (fid > PERFORMANCE_THRESHOLDS.FID) {
            console.warn(
              `Poor FID detected: ${fid.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.FID}ms)`
            );
          }
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.recordMetric('CLS', clsValue);

        if (clsValue > PERFORMANCE_THRESHOLDS.CLS) {
          console.warn(
            `Poor CLS detected: ${clsValue.toFixed(3)} (threshold: ${PERFORMANCE_THRESHOLDS.CLS})`
          );
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }
  }

  /**
   * Observe resource loading performance
   */
  private static observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const duration = entry.responseEnd - entry.startTime;

          // Categorize resources
          if (entry.name.includes('/api/')) {
            this.recordMetric('API_Response', duration);

            if (duration > PERFORMANCE_THRESHOLDS.API_SLOW) {
              console.warn(
                `Slow API response: ${entry.name} took ${duration.toFixed(2)}ms`
              );
            }
          } else if (entry.initiatorType === 'img') {
            this.recordMetric('Image_Load', duration);

            if (duration > PERFORMANCE_THRESHOLDS.IMAGE_SLOW) {
              console.warn(
                `Slow image load: ${entry.name} took ${duration.toFixed(2)}ms`
              );
            }
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource timing observation not supported');
      }
    }
  }

  /**
   * Observe navigation timing
   */
  private static observeNavigationTiming(): void {
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // Time to First Byte
          const ttfb = entry.responseStart - entry.requestStart;
          this.recordMetric('TTFB', ttfb);

          // First Contentful Paint
          if (entry.firstContentfulPaint) {
            this.recordMetric('FCP', entry.firstContentfulPaint);
          }

          // DOM Content Loaded
          const dcl =
            entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
          this.recordMetric('DCL', dcl);

          // Load Complete
          const loadComplete = entry.loadEventEnd - entry.loadEventStart;
          this.recordMetric('Load_Complete', loadComplete);
        });
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (e) {
        console.warn('Navigation timing observation not supported');
      }
    }
  }

  /**
   * Observe long tasks that block the main thread
   */
  private static observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.warn(
            `Long task detected: ${entry.duration.toFixed(2)}ms at ${entry.startTime.toFixed(2)}ms`
          );
          this.recordMetric('Long_Task', entry.duration);
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observation not supported');
      }
    }
  }

  /**
   * Record a performance metric
   */
  static recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);

    // Send to analytics if available
    try {
      if (typeof window !== 'undefined' && (window as any).Analytics) {
        (window as any).Analytics.track('performance_metric', {
          metric: name,
          value: value,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Analytics not available, continue silently
    }
  }

  /**
   * Get recorded metrics
   */
  static getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    coreWebVitals: { lcp?: number; fid?: number; cls?: number };
    loadingMetrics: { ttfb?: number; fcp?: number; dcl?: number };
    resourceMetrics: { avgApiResponse?: number; avgImageLoad?: number };
    issues: string[];
  } {
    const issues: string[] = [];

    const lcp = this.metrics.get('LCP');
    const fid = this.metrics.get('FID');
    const cls = this.metrics.get('CLS');
    const ttfb = this.metrics.get('TTFB');
    const fcp = this.metrics.get('FCP');
    const dcl = this.metrics.get('DCL');

    // Check for performance issues
    if (lcp && lcp > PERFORMANCE_THRESHOLDS.LCP) {
      issues.push(
        `LCP is ${lcp.toFixed(2)}ms (should be < ${PERFORMANCE_THRESHOLDS.LCP}ms)`
      );
    }

    if (fid && fid > PERFORMANCE_THRESHOLDS.FID) {
      issues.push(
        `FID is ${fid.toFixed(2)}ms (should be < ${PERFORMANCE_THRESHOLDS.FID}ms)`
      );
    }

    if (cls && cls > PERFORMANCE_THRESHOLDS.CLS) {
      issues.push(
        `CLS is ${cls.toFixed(3)} (should be < ${PERFORMANCE_THRESHOLDS.CLS})`
      );
    }

    if (ttfb && ttfb > PERFORMANCE_THRESHOLDS.TTFB) {
      issues.push(
        `TTFB is ${ttfb.toFixed(2)}ms (should be < ${PERFORMANCE_THRESHOLDS.TTFB}ms)`
      );
    }

    return {
      coreWebVitals: { lcp, fid, cls },
      loadingMetrics: { ttfb, fcp, dcl },
      resourceMetrics: {
        avgApiResponse: this.metrics.get('API_Response'),
        avgImageLoad: this.metrics.get('Image_Load'),
      },
      issues,
    };
  }

  /**
   * Cleanup observers
   */
  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

/**
 * Code splitting and lazy loading utilities
 */
export class CodeSplittingOptimizer {
  /**
   * Preload a route for better performance
   */
  static preloadRoute(route: string): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }

  /**
   * Preload multiple routes
   */
  static preloadRoutes(routes: string[]): void {
    routes.forEach(route => this.preloadRoute(route));
  }

  /**
   * Lazy load a component with error boundary
   */
  static createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    const LazyComponent = React.lazy(async () => {
      try {
        const startTime = performance.now();
        const module = await importFn();
        const loadTime = performance.now() - startTime;

        PerformanceMonitor.recordMetric('Component_Load', loadTime);

        if (loadTime > 1000) {
          console.warn(`Slow component load: ${loadTime.toFixed(2)}ms`);
        }

        return module;
      } catch (error) {
        console.error('Failed to load component:', error);
        throw error;
      }
    });

    return LazyComponent;
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  /**
   * Get current memory usage (if available)
   */
  static getMemoryUsage(): {
    used?: number;
    total?: number;
    percentage?: number;
  } {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return {};
    }

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const percentage = (used / total) * 100;

    // Warn if memory usage is high
    if (percentage > 80) {
      console.warn(`High memory usage detected: ${percentage.toFixed(1)}%`);
    }

    return { used, total, percentage };
  }

  /**
   * Monitor memory usage over time
   */
  static startMemoryMonitoring(intervalMs: number = 30000): () => void {
    if (typeof window === 'undefined') return () => {};

    const interval = setInterval(() => {
      const usage = this.getMemoryUsage();
      if (usage.percentage) {
        PerformanceMonitor.recordMetric('Memory_Usage', usage.percentage);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

/**
 * Bundle size analyzer
 */
export class BundleAnalyzer {
  /**
   * Analyze loaded scripts and their sizes
   */
  static analyzeBundleSize(): {
    scripts: Array<{ src: string; size?: number }>;
    totalEstimatedSize: number;
  } {
    if (typeof window === 'undefined') {
      return { scripts: [], totalEstimatedSize: 0 };
    }

    const scripts = Array.from(document.querySelectorAll('script[src]')).map(
      script => ({
        src: (script as HTMLScriptElement).src,
        size: undefined, // Size would need to be determined via network timing
      })
    );

    // Estimate total size based on resource timing if available
    let totalEstimatedSize = 0;
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      resources.forEach(resource => {
        if (resource.name.includes('.js')) {
          totalEstimatedSize += resource.transferSize || 0;
        }
      });
    }

    return { scripts, totalEstimatedSize };
  }
}

// Legacy exports for backward compatibility
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  imageLoadTime: number;
  interactionTime: number;
}

interface WebVitals {
  CLS: number;
  FID: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

// Singleton instance for backward compatibility
export const performanceMonitor = {
  measureRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    PerformanceMonitor.recordMetric(`${componentName}_Render`, renderTime);
    console.log(`${componentName} render time: ${renderTime}ms`);
    return result;
  },

  measureImageLoad(src: string): Promise<number> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const img = new Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;
        PerformanceMonitor.recordMetric('Image_Load', loadTime);
        console.log(`Image load time for ${src}: ${loadTime}ms`);
        resolve(loadTime);
      };

      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        console.warn(`Image failed to load ${src} after ${loadTime}ms`);
        resolve(loadTime);
      };

      img.src = src;
    });
  },

  getMetrics() {
    return PerformanceMonitor.getPerformanceSummary();
  },

  reportPerformance() {
    return PerformanceMonitor.getPerformanceSummary();
  },
};

// Hook for React components
export function usePerformanceMonitor() {
  return {
    measureRender: performanceMonitor.measureRender,
    measureImageLoad: performanceMonitor.measureImageLoad,
    getMetrics: performanceMonitor.getMetrics,
    reportPerformance: performanceMonitor.reportPerformance,
  };
}

// Enhanced optimization utilities
export const optimizationUtils = {
  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Enhanced lazy load images with intersection observer
  lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const startTime = performance.now();
                img.src = src;
                img.onload = () => {
                  const loadTime = performance.now() - startTime;
                  PerformanceMonitor.recordMetric('Lazy_Image_Load', loadTime);
                  observer.disconnect();
                  resolve();
                };
                img.onerror = () => {
                  observer.disconnect();
                  reject(new Error(`Failed to load image: ${src}`));
                };
              }
            });
          },
          { threshold: 0.1, rootMargin: '50px' }
        );
        observer.observe(img);
      } else {
        // Fallback for browsers without IntersectionObserver
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      }
    });
  },

  // Preload critical resources
  preloadResource(href: string, as: string = 'fetch'): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    }
  },

  // Prefetch next page resources
  prefetchPage(href: string): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  },

  // Check if device has slow connection
  isSlowConnection(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData === true
      );
    }
    return false;
  },

  // Get device memory (if available)
  getDeviceMemory(): number {
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }
    return 4; // Default assumption
  },

  // Adaptive loading based on device capabilities
  shouldLoadHighQuality(): boolean {
    const hasGoodConnection = !this.isSlowConnection();
    const hasEnoughMemory = this.getDeviceMemory() >= 4;
    return hasGoodConnection && hasEnoughMemory;
  },

  // Resource hints for better performance
  addResourceHints(urls: string[]): void {
    if (typeof document === 'undefined') return;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = new URL(url).origin;
      document.head.appendChild(link);
    });
  },
};

// Enhanced Web Vitals reporting (for Next.js)
export function reportWebVitals(metric: any) {
  PerformanceMonitor.recordMetric(metric.name, metric.value);

  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}: ${metric.value}`);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    try {
      if (typeof window !== 'undefined' && (window as any).Analytics) {
        (window as any).Analytics.track('web_vital', {
          name: metric.name,
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          id: metric.id,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Analytics not available, continue silently
    }
  }
}

// Enhanced bundle size analyzer
export const bundleAnalyzer = {
  logBundleSize() {
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      const analysis = BundleAnalyzer.analyzeBundleSize();
      console.group('Bundle Analysis');
      console.log(
        `Total estimated size: ${(analysis.totalEstimatedSize / 1024).toFixed(2)} KB`
      );
      analysis.scripts.forEach(script => {
        console.log(`Script: ${script.src}`);
      });
      console.groupEnd();
    }
  },

  // Analyze component bundle impact
  analyzeComponent(componentName: string, size: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Component ${componentName} estimated size: ${(size / 1024).toFixed(2)} KB`
      );
      PerformanceMonitor.recordMetric(`${componentName}_Bundle_Size`, size);
    }
  },
};

// Initialize performance monitoring when the module loads
if (typeof window !== 'undefined') {
  // Wait for the page to load before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PerformanceMonitor.init();
    });
  } else {
    PerformanceMonitor.init();
  }
}
