import { useEffect, useCallback, useRef } from 'react';
import { optimizationUtils, performanceMonitor } from '@/lib/performance';
import { preloadComponents } from '@/lib/code-splitting';
import { imageUtils } from '@/lib/image-optimization';

// Hook for performance optimization
export function usePerformanceOptimization() {
  const componentMountTime = useRef<number>(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - componentMountTime.current;
    console.log(`Component mounted in ${mountTime}ms`);
  }, []);

  const measureOperation = useCallback(
    <T>(operation: () => T, operationName: string): T => {
      return performanceMonitor.measureRender(operationName, operation);
    },
    []
  );

  const preloadCriticalResources = useCallback((resources: string[]) => {
    resources.forEach(resource => {
      optimizationUtils.preloadResource(resource);
    });
  }, []);

  const prefetchNextPage = useCallback((href: string) => {
    optimizationUtils.prefetchPage(href);
  }, []);

  return {
    measureOperation,
    preloadCriticalResources,
    prefetchNextPage,
    isSlowConnection: optimizationUtils.isSlowConnection(),
    shouldLoadHighQuality: optimizationUtils.shouldLoadHighQuality(),
  };
}

// Hook for lazy loading optimization
export function useLazyLoading() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observeElement = useCallback(
    (
      element: HTMLElement,
      callback: () => void,
      options: IntersectionObserverInit = {}
    ) => {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                callback();
                observerRef.current?.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.1,
            rootMargin: '50px',
            ...options,
          }
        );
      }

      observerRef.current.observe(element);
    },
    []
  );

  const disconnect = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { observeElement, disconnect };
}

// Hook for preloading components based on user interaction
export function useComponentPreloading() {
  const preloadCustomization = useCallback(() => {
    preloadComponents.preloadCustomization();
  }, []);

  const preloadCart = useCallback(() => {
    preloadComponents.preloadCart();
  }, []);

  const preloadCheckout = useCallback(() => {
    preloadComponents.preloadCheckout();
  }, []);

  const preloadRelatedItems = useCallback(() => {
    preloadComponents.preloadRelatedItems();
  }, []);

  // Preload on hover with debounce
  const handleHoverPreload = useCallback(
    optimizationUtils.debounce((component: string) => {
      switch (component) {
        case 'customization':
          preloadCustomization();
          break;
        case 'cart':
          preloadCart();
          break;
        case 'checkout':
          preloadCheckout();
          break;
        case 'related':
          preloadRelatedItems();
          break;
      }
    }, 100),
    [preloadCustomization, preloadCart, preloadCheckout, preloadRelatedItems]
  );

  return {
    preloadCustomization,
    preloadCart,
    preloadCheckout,
    preloadRelatedItems,
    handleHoverPreload,
  };
}

// Hook for image optimization
export function useImageOptimization() {
  const preloadImages = useCallback(async (images: string[]) => {
    try {
      await imageUtils.preloadCriticalImages(images);
    } catch (error) {
      console.warn('Failed to preload some images:', error);
    }
  }, []);

  const getOptimalImageProps = useCallback(
    (
      src: string,
      alt: string,
      options: Parameters<typeof imageUtils.getImageProps>[2] = {}
    ) => {
      return imageUtils.getImageProps(src, alt, {
        quality: optimizationUtils.shouldLoadHighQuality() ? 85 : 60,
        ...options,
      });
    },
    []
  );

  return {
    preloadImages,
    getOptimalImageProps,
    supportsWebP: imageUtils.supportsFormat('webp'),
    supportsAVIF: imageUtils.supportsFormat('avif'),
    optimalFormat: imageUtils.getOptimalFormat(),
  };
}

// Hook for adaptive loading based on device capabilities
export function useAdaptiveLoading() {
  const deviceCapabilities = {
    memory: optimizationUtils.getDeviceMemory(),
    connection: optimizationUtils.isSlowConnection() ? 'slow' : 'fast',
    shouldLoadHighQuality: optimizationUtils.shouldLoadHighQuality(),
  };

  const getAdaptiveConfig = useCallback(() => {
    const { memory, connection, shouldLoadHighQuality } = deviceCapabilities;

    return {
      // Image quality based on device capabilities
      imageQuality: shouldLoadHighQuality ? 85 : 60,

      // Number of items to load initially
      initialLoadCount: memory >= 8 ? 12 : memory >= 4 ? 8 : 6,

      // Preload strategy
      preloadStrategy: connection === 'fast' ? 'aggressive' : 'conservative',

      // Animation preferences
      enableAnimations: memory >= 4 && connection === 'fast',

      // Lazy loading threshold
      lazyLoadThreshold: connection === 'fast' ? 0.1 : 0.3,
    };
  }, [deviceCapabilities]);

  return {
    deviceCapabilities,
    adaptiveConfig: getAdaptiveConfig(),
  };
}

// Hook for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;

    if (renderCount.current === 1) {
      // First render
      const initialRenderTime = performance.now() - mountTime.current;
      console.log(`${componentName} initial render: ${initialRenderTime}ms`);
    }
  });

  const trackUserInteraction = useCallback(
    (action: string, details?: Record<string, any>) => {
      const timestamp = performance.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`User interaction in ${componentName}: ${action}`, details);
      }

      // Send to analytics in production
      if (
        process.env.NODE_ENV === 'production' &&
        typeof window !== 'undefined'
      ) {
        // Example: Send to Google Analytics
        // gtag('event', 'user_interaction', {
        //   component: componentName,
        //   action,
        //   timestamp,
        //   ...details,
        // });
      }
    },
    [componentName]
  );

  const reportPerformance = useCallback(() => {
    return performanceMonitor.reportPerformance();
  }, []);

  return {
    renderCount: renderCount.current,
    trackUserInteraction,
    reportPerformance,
  };
}

// Hook for bundle size optimization
export function useBundleOptimization() {
  const checkBundleSize = useCallback(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      // Estimate current bundle size
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const nextScripts = scripts.filter(script =>
        (script as HTMLScriptElement).src.includes('_next/static')
      );

      console.log(`Loaded ${nextScripts.length} Next.js script chunks`);

      // Check for large chunks
      nextScripts.forEach(script => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('chunks/pages') || src.includes('chunks/main')) {
          console.log(`Critical chunk: ${src}`);
        }
      });
    }
  }, []);

  const analyzeComponentSize = useCallback(
    (componentName: string, estimatedSize: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Component ${componentName} estimated size: ${estimatedSize} bytes`
        );

        if (estimatedSize > 50000) {
          // 50KB
          console.warn(
            `Large component detected: ${componentName} (${estimatedSize} bytes)`
          );
        }
      }
    },
    []
  );

  return {
    checkBundleSize,
    analyzeComponentSize,
  };
}
