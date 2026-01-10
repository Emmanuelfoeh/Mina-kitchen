// Performance monitoring and optimization utilities

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

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private vitals: Partial<WebVitals> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.vitals.LCP = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            entry => entry.name === 'first-contentful-paint'
          );
          if (fcpEntry) {
            this.vitals.FCP = fcpEntry.startTime;
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver(list => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.vitals.CLS = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.vitals.TTFB = navigation.responseStart - navigation.fetchStart;
      }
    });
  }

  // Measure component render time
  measureRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();

    console.log(`${componentName} render time: ${endTime - startTime}ms`);
    return result;
  }

  // Measure image load time
  measureImageLoad(src: string): Promise<number> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const img = new Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;
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
  }

  // Get current metrics
  getMetrics(): {
    metrics: Partial<PerformanceMetrics>;
    vitals: Partial<WebVitals>;
  } {
    return {
      metrics: { ...this.metrics },
      vitals: { ...this.vitals },
    };
  }

  // Report performance data (for analytics)
  reportPerformance() {
    const data = this.getMetrics();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Metrics');
      console.table(data.metrics);
      console.table(data.vitals);
      console.groupEnd();
    }

    // Send to analytics in production
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      // Example: Send to Google Analytics or other analytics service
      // gtag('event', 'performance_metrics', data);
    }

    return data;
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export function usePerformanceMonitor() {
  return {
    measureRender: performanceMonitor.measureRender.bind(performanceMonitor),
    measureImageLoad:
      performanceMonitor.measureImageLoad.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    reportPerformance:
      performanceMonitor.reportPerformance.bind(performanceMonitor),
  };
}

// Utility functions for optimization
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

  // Lazy load images with intersection observer
  lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                img.src = src;
                img.onload = () => {
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
          { threshold: 0.1 }
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
        connection.effectiveType === '2g'
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
};

// Web Vitals reporting (for Next.js)
export function reportWebVitals(metric: any) {
  const monitor = performanceMonitor as any;
  monitor.vitals[metric.name as keyof WebVitals] = metric.value;

  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}: ${metric.value}`);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
  }
}

// Bundle size analyzer (development only)
export const bundleAnalyzer = {
  logBundleSize() {
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      // Estimate bundle size from loaded scripts
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      let totalSize = 0;

      scripts.forEach(script => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('_next/static')) {
          // This is a rough estimate - in production you'd use actual bundle analysis
          console.log(`Script: ${src}`);
        }
      });

      console.log(`Estimated total bundle size: ${totalSize} bytes`);
    }
  },

  // Analyze component bundle impact
  analyzeComponent(componentName: string, size: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component ${componentName} estimated size: ${size} bytes`);
    }
  },
};
