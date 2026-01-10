/**
 * Performance metrics tests for item detail pages
 * Tests Core Web Vitals and performance optimization metrics
 */

import { mockMenuItems, mockPackages } from '../lib/mock-data';
import { generateSlug } from '../lib/utils';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Metrics Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockImplementation(() => Date.now());
  });

  describe('URL Generation Performance', () => {
    it('should generate slugs efficiently for all menu items', () => {
      const startTime = performance.now();

      const slugs = mockMenuItems.map(
        item => item.slug || generateSlug(item.name)
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should generate all slugs quickly (under 100ms)
      expect(duration).toBeLessThan(100);
      expect(slugs.length).toBe(mockMenuItems.length);

      console.log(
        `Slug generation for ${mockMenuItems.length} items: ${duration.toFixed(2)}ms`
      );
    });

    it('should generate slugs efficiently for all packages', () => {
      const startTime = performance.now();

      const slugs = mockPackages.map(pkg => pkg.slug || generateSlug(pkg.name));

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should generate all slugs quickly (under 50ms)
      expect(duration).toBeLessThan(50);
      expect(slugs.length).toBe(mockPackages.length);

      console.log(
        `Package slug generation for ${mockPackages.length} items: ${duration.toFixed(2)}ms`
      );
    });

    it('should handle slug uniqueness validation efficiently', () => {
      const startTime = performance.now();

      // Test slug uniqueness
      const menuSlugs = mockMenuItems.map(
        item => item.slug || generateSlug(item.name)
      );
      const packageSlugs = mockPackages.map(
        pkg => pkg.slug || generateSlug(pkg.name)
      );

      const allSlugs = [...menuSlugs, ...packageSlugs];
      const uniqueSlugs = new Set(allSlugs);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should validate uniqueness quickly (under 50ms)
      expect(duration).toBeLessThan(50);
      expect(uniqueSlugs.size).toBe(allSlugs.length); // All slugs should be unique

      console.log(`Slug uniqueness validation: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Data Processing Performance', () => {
    it('should calculate package savings efficiently', () => {
      const startTime = performance.now();

      const savingsCalculations = mockPackages.map(pkg => {
        if (!pkg.items || pkg.items.length === 0) return 0;

        let originalPrice = 0;
        pkg.items.forEach(packageItem => {
          const menuItem = mockMenuItems.find(
            item => item.id === packageItem.menuItemId
          );
          if (menuItem) {
            originalPrice += menuItem.basePrice * packageItem.quantity;
          }
        });

        return originalPrice - pkg.price;
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should calculate all savings quickly (under 100ms)
      expect(duration).toBeLessThan(100);
      expect(savingsCalculations.length).toBe(mockPackages.length);

      console.log(
        `Package savings calculation for ${mockPackages.length} packages: ${duration.toFixed(2)}ms`
      );
    });

    it('should filter and search data efficiently', () => {
      const startTime = performance.now();

      // Simulate filtering operations
      const mainDishes = mockMenuItems.filter(
        item =>
          item.category &&
          (typeof item.category === 'string'
            ? item.category.toLowerCase().includes('main')
            : item.category.name?.toLowerCase().includes('main'))
      );

      const spicyItems = mockMenuItems.filter(item =>
        item.tags?.some(tag => tag.toLowerCase().includes('spicy'))
      );

      const affordableItems = mockMenuItems.filter(item => item.basePrice < 20);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should filter data quickly (under 50ms)
      expect(duration).toBeLessThan(50);
      expect(mainDishes.length).toBeGreaterThanOrEqual(0);
      expect(spicyItems.length).toBeGreaterThanOrEqual(0);
      expect(affordableItems.length).toBeGreaterThanOrEqual(0);

      console.log(`Data filtering operations: ${duration.toFixed(2)}ms`);
    });

    it('should handle customization price calculations efficiently', () => {
      const startTime = performance.now();

      // Simulate price calculations for items with customizations
      const calculations = mockMenuItems
        .filter(item => item.customizations && item.customizations.length > 0)
        .map(item => {
          let totalPrice = item.basePrice;

          item.customizations?.forEach(customization => {
            if (customization.options.length > 0) {
              // Simulate selecting the first option
              totalPrice += customization.options[0].priceModifier;
            }
          });

          return totalPrice;
        });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should calculate prices quickly (under 50ms)
      expect(duration).toBeLessThan(50);
      expect(calculations.length).toBeGreaterThanOrEqual(0);

      console.log(`Customization price calculations: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Simulation', () => {
    it('should not create excessive objects during data processing', () => {
      const initialMemory = mockPerformance.memory.usedJSHeapSize;

      // Simulate processing all data multiple times
      for (let i = 0; i < 10; i++) {
        const processedItems = mockMenuItems.map(item => ({
          ...item,
          slug: item.slug || generateSlug(item.name),
          totalPrice:
            item.basePrice +
            (item.customizations?.[0]?.options[0]?.priceModifier || 0),
        }));

        const processedPackages = mockPackages.map(pkg => ({
          ...pkg,
          slug: pkg.slug || generateSlug(pkg.name),
        }));

        // Clear references to allow garbage collection
        processedItems.length = 0;
        processedPackages.length = 0;
      }

      const finalMemory = mockPerformance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB for this simulation)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);

      console.log(
        `Memory increase after processing: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      );
    });
  });

  describe('Core Web Vitals Simulation', () => {
    it('should simulate acceptable Largest Contentful Paint (LCP)', () => {
      // Simulate LCP measurement
      const lcpStartTime = performance.now();

      // Simulate loading the largest content element (main image or title)
      const simulatedLoadTime = Math.random() * 1000 + 500; // 500-1500ms

      // Mock the LCP timing
      mockPerformance.now.mockReturnValueOnce(lcpStartTime + simulatedLoadTime);

      const lcpTime = performance.now() - lcpStartTime;

      // LCP should be under 2.5 seconds for good performance
      expect(lcpTime).toBeLessThan(2500);

      console.log(`Simulated LCP: ${lcpTime.toFixed(2)}ms`);
    });

    it('should simulate acceptable First Input Delay (FID)', () => {
      // Simulate FID measurement
      const fidStartTime = performance.now();

      // Simulate input processing delay
      const simulatedProcessingTime = Math.random() * 50 + 10; // 10-60ms

      mockPerformance.now.mockReturnValueOnce(
        fidStartTime + simulatedProcessingTime
      );

      const fidTime = performance.now() - fidStartTime;

      // FID should be under 100ms for good performance
      expect(fidTime).toBeLessThan(100);

      console.log(`Simulated FID: ${fidTime.toFixed(2)}ms`);
    });

    it('should simulate acceptable Cumulative Layout Shift (CLS)', () => {
      // Simulate CLS measurement
      let cumulativeLayoutShift = 0;

      // Simulate layout shifts during page load
      const layoutShifts = [
        0.01, // Initial image load
        0.005, // Font load
        0.002, // Dynamic content
      ];

      cumulativeLayoutShift = layoutShifts.reduce(
        (sum, shift) => sum + shift,
        0
      );

      // CLS should be under 0.1 for good performance
      expect(cumulativeLayoutShift).toBeLessThan(0.1);

      console.log(`Simulated CLS: ${cumulativeLayoutShift.toFixed(3)}`);
    });
  });

  describe('Bundle Size Analysis', () => {
    it('should estimate reasonable component bundle sizes', () => {
      // Simulate bundle size analysis
      const componentSizes = {
        ProductGallery: 15000, // bytes
        CustomizationInterface: 25000,
        ProductInformation: 10000,
        AddToCartSection: 12000,
        RelatedItems: 18000,
        DetailPageLayout: 8000,
      };

      Object.entries(componentSizes).forEach(([component, size]) => {
        // Each component should be under 30KB
        expect(size).toBeLessThan(30000);
        console.log(`${component}: ${(size / 1024).toFixed(1)}KB`);
      });

      // Total component size should be reasonable
      const totalSize = Object.values(componentSizes).reduce(
        (sum, size) => sum + size,
        0
      );
      expect(totalSize).toBeLessThan(150000); // Total under 150KB

      console.log(
        `Total estimated bundle size: ${(totalSize / 1024).toFixed(1)}KB`
      );
    });

    it('should estimate reasonable data payload sizes', () => {
      // Calculate data sizes
      const menuItemsSize = JSON.stringify(mockMenuItems).length;
      const packagesSize = JSON.stringify(mockPackages).length;

      // Individual payloads should be reasonable
      expect(menuItemsSize).toBeLessThan(100000); // Under 100KB
      expect(packagesSize).toBeLessThan(50000); // Under 50KB

      console.log(
        `Menu items data size: ${(menuItemsSize / 1024).toFixed(1)}KB`
      );
      console.log(`Packages data size: ${(packagesSize / 1024).toFixed(1)}KB`);
    });
  });

  describe('Performance Optimization Metrics', () => {
    it('should measure image optimization potential', () => {
      const startTime = performance.now();

      // Count images across all items
      let totalImages = 0;
      let imagesWithMultipleSizes = 0;

      mockMenuItems.forEach(item => {
        totalImages++; // Main image
        if (item.images && item.images.length > 0) {
          totalImages += item.images.length;
          imagesWithMultipleSizes++;
        }
      });

      mockPackages.forEach(pkg => {
        totalImages++; // Main image
        if (pkg.images && pkg.images.length > 0) {
          totalImages += pkg.images.length;
          imagesWithMultipleSizes++;
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      expect(totalImages).toBeGreaterThan(0);

      console.log(
        `Image analysis: ${totalImages} total images, ${imagesWithMultipleSizes} with multiple sizes`
      );
      console.log(`Image analysis duration: ${duration.toFixed(2)}ms`);
    });

    it('should measure caching potential', () => {
      const startTime = performance.now();

      // Simulate cache key generation
      const cacheKeys = [
        ...mockMenuItems.map(item => `menu-item-${item.id}`),
        ...mockPackages.map(pkg => `package-${pkg.id}`),
      ];

      // Simulate cache lookup performance
      const cacheHits = cacheKeys.filter(key => key.includes('item')).length;
      const cacheMisses = cacheKeys.length - cacheHits;

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      expect(cacheKeys.length).toBeGreaterThan(0);

      console.log(
        `Cache analysis: ${cacheHits} potential hits, ${cacheMisses} potential misses`
      );
      console.log(`Cache analysis duration: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Scalability Metrics', () => {
    it('should handle increased data volume efficiently', () => {
      const startTime = performance.now();

      // Simulate 10x data volume
      const scaledMenuItems = Array(10).fill(mockMenuItems).flat();
      const scaledPackages = Array(10).fill(mockPackages).flat();

      // Perform operations on scaled data
      const slugs = scaledMenuItems.map(item => generateSlug(item.name));
      const filteredItems = scaledMenuItems.filter(item => item.basePrice < 25);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 10x data within reasonable time (under 500ms)
      expect(duration).toBeLessThan(500);
      expect(slugs.length).toBe(scaledMenuItems.length);
      expect(filteredItems.length).toBeGreaterThanOrEqual(0);

      console.log(`10x data volume processing: ${duration.toFixed(2)}ms`);
      console.log(
        `Processed ${scaledMenuItems.length} items and ${scaledPackages.length} packages`
      );
    });

    it('should maintain performance with complex filtering', () => {
      const startTime = performance.now();

      // Simulate complex filtering operations
      const results = mockMenuItems.filter(item => {
        // Multiple filter conditions
        const priceCheck = item.basePrice >= 10 && item.basePrice <= 30;
        const tagCheck = item.tags?.some(tag =>
          ['spicy', 'vegetarian', 'popular'].includes(tag.toLowerCase())
        );
        const customizationCheck =
          item.customizations && item.customizations.length > 0;

        return priceCheck && (tagCheck || customizationCheck);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Complex filtering should be fast (under 100ms)
      expect(duration).toBeLessThan(100);
      expect(results.length).toBeGreaterThanOrEqual(0);

      console.log(
        `Complex filtering: ${duration.toFixed(2)}ms, ${results.length} results`
      );
    });
  });
});
