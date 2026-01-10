import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamic import wrapper with loading states
export function createDynamicComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    ssr?: boolean;
    suspense?: boolean;
  } = {}
) {
  const { ssr = true, suspense = false } = options;

  return dynamic(importFn, {
    ssr,
  });
}

// Preload components for better UX
export const preloadComponents = {
  // Preload customization interface when user hovers over customize button
  preloadCustomization: () => {
    import('@/components/ui/customization-interface');
  },

  // Preload cart when user adds first item
  preloadCart: () => {
    import('@/components/cart/cart-sidebar');
  },

  // Preload checkout when user opens cart
  preloadCheckout: () => {
    import('@/app/checkout/page');
  },

  // Preload related items when user scrolls down
  preloadRelatedItems: () => {
    import('@/components/ui/related-items');
  },
};

// Bundle splitting configuration
export const bundleConfig = {
  // Critical components that should be in main bundle
  critical: [
    'ProductGallery',
    'ProductInformation',
    'DetailPageLayout',
    'LoadingIndicator',
  ],

  // Components that can be lazy loaded
  lazy: [
    'CustomizationInterface',
    'PackageCustomizationInterface',
    'RelatedItems',
    'RelatedPackages',
    'CartSidebar',
  ],

  // Vendor libraries that should be in separate chunks
  vendor: [
    'react',
    'react-dom',
    'next',
    'lucide-react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-select',
  ],
};

// Performance monitoring for code splitting
export function trackComponentLoad(componentName: string, loadTime: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Component ${componentName} loaded in ${loadTime}ms`);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to Google Analytics
    // gtag('event', 'component_load', {
    //   component_name: componentName,
    //   load_time: loadTime,
    // });
  }
}

// Utility to measure dynamic import performance
export function measureDynamicImport<T>(
  importFn: () => Promise<T>,
  componentName: string
): Promise<T> {
  const startTime = performance.now();

  return importFn().then(result => {
    const loadTime = performance.now() - startTime;
    trackComponentLoad(componentName, loadTime);
    return result;
  });
}
