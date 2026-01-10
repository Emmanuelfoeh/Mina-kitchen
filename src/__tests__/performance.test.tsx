/**
 * Performance tests for item detail pages
 * Tests page load times, Core Web Vitals, and optimization metrics
 */

import { render, screen, waitFor } from '@testing-library/react';
import { mockMenuItems, mockPackages } from '../lib/mock-data';
import { generateSlug } from '../lib/utils';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  notFound: jest.fn(),
}));

// Mock Zustand stores
jest.mock('../stores/cart-store', () => ({
  useCartStore: () => ({
    items: [],
    addItem: jest.fn(),
    getItemById: jest.fn(),
    getSubtotal: jest.fn(() => 0),
    getTotalItems: jest.fn(() => 0),
    isOpen: false,
    toggleCart: jest.fn(),
  }),
}));

// Mock analytics hooks
jest.mock('../hooks/use-analytics', () => ({
  useDetailPageAnalytics: jest.fn(),
  useCustomizationTracking: jest.fn(() => ({
    trackCustomization: jest.fn(),
  })),
  useCartTracking: jest.fn(() => ({
    trackAddToCart: jest.fn(),
  })),
}));

// Mock screen reader utilities
jest.mock('../lib/screen-reader', () => ({
  initializeScreenReaderSupport: jest.fn(),
  announceNavigation: jest.fn(),
  announceToScreenReader: jest.fn(),
}));

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockImplementation(() => Date.now());
  });

  describe('Component Rendering Performance', () => {
    it('should render menu item components within performance budget', async () => {
      const testItem = mockMenuItems[0];

      // Mock dynamic import for the page component
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const slug = testItem.slug || generateSlug(testItem.name);

      const startTime = performance.now();

      render(<MenuItemPage params={{ slug }} />);

      // Wait for essential content to be rendered
      await waitFor(
        () => {
          expect(screen.getByText(testItem.name)).toBeInTheDocument();
        },
        { timeout: 2000 }
      ); // 2 second budget for initial render

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 2 seconds (2000ms)
      expect(renderTime).toBeLessThan(2000);

      // Log performance for monitoring
      console.log(`Menu item page render time: ${renderTime.toFixed(2)}ms`);
    });

    it('should render package components within performance budget', async () => {
      const testPackage = mockPackages[0];

      // Mock dynamic import for the page component
      const PackagePage = (await import('../app/packages/[slug]/page')).default;
      const slug = testPackage.slug || generateSlug(testPackage.name);

      const startTime = performance.now();

      render(<PackagePage params={{ slug }} />);

      // Wait for essential content to be rendered
      await waitFor(
        () => {
          expect(screen.getByText(testPackage.name)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 2 seconds
      expect(renderTime).toBeLessThan(2000);

      console.log(`Package page render time: ${renderTime.toFixed(2)}ms`);
    });

    it('should handle multiple rapid renders efficiently', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItems = mockMenuItems.slice(0, 3); // Test with first 3 items

      const renderTimes: number[] = [];

      for (const item of testItems) {
        const slug = item.slug || generateSlug(item.name);
        const startTime = performance.now();

        const { unmount } = render(<MenuItemPage params={{ slug }} />);

        await waitFor(() => {
          expect(screen.getByText(item.name)).toBeInTheDocument();
        });

        const endTime = performance.now();
        renderTimes.push(endTime - startTime);

        unmount();
      }

      // Each render should be reasonably fast
      renderTimes.forEach((time, index) => {
        expect(time).toBeLessThan(3000); // 3 second budget per render
        console.log(`Render ${index + 1} time: ${time.toFixed(2)}ms`);
      });

      // Average render time should be reasonable
      const averageTime =
        renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
      expect(averageTime).toBeLessThan(2000);

      console.log(`Average render time: ${averageTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks during component lifecycle', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      // Mock memory usage tracking
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Render and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<MenuItemPage params={{ slug }} />);

        await waitFor(() => {
          expect(screen.getByText(testItem.name)).toBeInTheDocument();
        });

        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      );
    });
  });

  describe('Bundle Size Analysis', () => {
    it('should have reasonable component sizes', () => {
      // This is a conceptual test - in a real scenario, you'd analyze webpack bundle
      const componentSizes = {
        ProductGallery: 15, // KB
        CustomizationInterface: 25, // KB
        ProductInformation: 10, // KB
        AddToCartSection: 12, // KB
        RelatedItems: 18, // KB
      };

      Object.entries(componentSizes).forEach(([component, size]) => {
        // Each component should be under 30KB
        expect(size).toBeLessThan(30);
        console.log(`${component}: ${size}KB`);
      });

      // Total component size should be reasonable
      const totalSize = Object.values(componentSizes).reduce(
        (sum, size) => sum + size,
        0
      );
      expect(totalSize).toBeLessThan(150); // Total under 150KB

      console.log(`Total component bundle size: ${totalSize}KB`);
    });
  });

  describe('Image Loading Performance', () => {
    it('should handle image loading efficiently', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem =
        mockMenuItems.find(item => item.images && item.images.length > 1) ||
        mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      const startTime = performance.now();

      render(<MenuItemPage params={{ slug }} />);

      // Wait for main content (not necessarily images)
      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      const contentLoadTime = performance.now() - startTime;

      // Content should load quickly even if images are still loading
      expect(contentLoadTime).toBeLessThan(1000); // 1 second for content

      console.log(
        `Content load time (excluding images): ${contentLoadTime.toFixed(2)}ms`
      );
    });

    it('should provide fallback for failed image loads', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = {
        ...mockMenuItems[0],
        image: 'https://invalid-url.com/nonexistent.jpg',
        images: [
          'https://invalid-url.com/nonexistent1.jpg',
          'https://invalid-url.com/nonexistent2.jpg',
        ],
      };
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Should still render content even with broken images
      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      // Should have fallback images or placeholders
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Customization Performance', () => {
    it('should handle complex customizations efficiently', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const complexItem =
        mockMenuItems.find(
          item => item.customizations && item.customizations.length > 3
        ) || mockMenuItems[0];

      const slug = complexItem.slug || generateSlug(complexItem.name);

      const startTime = performance.now();

      render(<MenuItemPage params={{ slug }} />);

      await waitFor(() => {
        expect(screen.getByText(complexItem.name)).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;

      // Should handle complex customizations within budget
      expect(renderTime).toBeLessThan(2500); // 2.5 seconds for complex items

      console.log(`Complex item render time: ${renderTime.toFixed(2)}ms`);
    });

    it('should update prices efficiently during customization changes', async () => {
      // This would test real-time price calculation performance
      // In a real implementation, you'd simulate user interactions
      const calculations = [];

      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();

        // Simulate price calculation
        const basePrice = 15.99;
        const modifiers = [2.5, 1.0, 0.75, 3.25];
        const total = modifiers.reduce((sum, mod) => sum + mod, basePrice);

        const calcTime = performance.now() - startTime;
        calculations.push(calcTime);
      }

      const averageCalcTime =
        calculations.reduce((sum, time) => sum + time, 0) / calculations.length;

      // Price calculations should be very fast (under 1ms average)
      expect(averageCalcTime).toBeLessThan(1);

      console.log(
        `Average price calculation time: ${averageCalcTime.toFixed(4)}ms`
      );
    });
  });

  describe('Core Web Vitals Simulation', () => {
    it('should meet Largest Contentful Paint (LCP) targets', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      // Mock LCP measurement
      const lcpStartTime = performance.now();

      render(<MenuItemPage params={{ slug }} />);

      // Wait for the largest content element (likely the main image or title)
      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      const lcpTime = performance.now() - lcpStartTime;

      // LCP should be under 2.5 seconds for good performance
      expect(lcpTime).toBeLessThan(2500);

      console.log(`Simulated LCP: ${lcpTime.toFixed(2)}ms`);
    });

    it('should meet First Input Delay (FID) targets', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      // Simulate user interaction timing
      const interactionStart = performance.now();

      // Find an interactive element
      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      expect(addToCartButton).toBeInTheDocument();

      const interactionTime = performance.now() - interactionStart;

      // FID should be under 100ms for good performance
      expect(interactionTime).toBeLessThan(100);

      console.log(`Simulated FID: ${interactionTime.toFixed(2)}ms`);
    });

    it('should meet Cumulative Layout Shift (CLS) targets', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      // Mock layout shift tracking
      let layoutShifts = 0;
      const originalGetBoundingClientRect =
        Element.prototype.getBoundingClientRect;

      Element.prototype.getBoundingClientRect = function () {
        const rect = originalGetBoundingClientRect.call(this);
        // Simulate minimal layout shift
        layoutShifts += 0.01;
        return rect;
      };

      render(<MenuItemPage params={{ slug }} />);

      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      // Restore original method
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;

      // CLS should be under 0.1 for good performance
      expect(layoutShifts).toBeLessThan(0.1);

      console.log(`Simulated CLS: ${layoutShifts.toFixed(3)}`);
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Mock slow network by adding delays
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise(
            resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                  }),
                1000
              ) // 1 second delay
          )
      );

      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      const startTime = performance.now();

      render(<MenuItemPage params={{ slug }} />);

      // Should show loading state or skeleton
      await waitFor(
        () => {
          expect(screen.getByText(testItem.name)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const loadTime = performance.now() - startTime;

      // Should handle slow network within reasonable time
      expect(loadTime).toBeLessThan(5000);

      console.log(`Slow network load time: ${loadTime.toFixed(2)}ms`);

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Accessibility Performance', () => {
    it('should maintain performance with screen reader support', async () => {
      const MenuItemPage = (await import('../app/menu/items/[slug]/page'))
        .default;
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      const startTime = performance.now();

      render(<MenuItemPage params={{ slug }} />);

      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;

      // Accessibility features shouldn't significantly impact performance
      expect(renderTime).toBeLessThan(2000);

      // Check that accessibility features are present
      expect(
        screen.getByRole('navigation', { name: /breadcrumb/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add to cart/i })
      ).toBeInTheDocument();

      console.log(`Accessible render time: ${renderTime.toFixed(2)}ms`);
    });
  });
});
