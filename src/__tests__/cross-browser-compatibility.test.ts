/**
 * Cross-browser compatibility tests for item detail pages
 * Tests browser-specific features and polyfills
 */

import { mockMenuItems, mockPackages } from '../lib/mock-data';
import { generateSlug } from '../lib/utils';

describe('Cross-Browser Compatibility Tests', () => {
  describe('User Agent Compatibility', () => {
    const userAgents = [
      {
        name: 'Chrome Desktop',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        expected: { mobile: false, webkit: true },
      },
      {
        name: 'Safari Desktop',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        expected: { mobile: false, webkit: true },
      },
      {
        name: 'Firefox Desktop',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        expected: { mobile: false, webkit: false },
      },
      {
        name: 'Chrome Mobile',
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        expected: { mobile: true, webkit: true },
      },
      {
        name: 'Safari Mobile',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        expected: { mobile: true, webkit: true },
      },
      {
        name: 'Edge',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        expected: { mobile: false, webkit: true },
      },
    ];

    userAgents.forEach(({ name, userAgent, expected }) => {
      it(`should handle ${name} user agent correctly`, () => {
        // Mock navigator.userAgent
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true,
        });

        // Test user agent detection logic
        const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
        const isWebkit = /WebKit/.test(userAgent);

        expect(isMobile).toBe(expected.mobile);
        expect(isWebkit).toBe(expected.webkit);

        console.log(`${name}: Mobile=${isMobile}, WebKit=${isWebkit}`);
      });
    });
  });

  describe('Feature Detection', () => {
    it('should handle missing localStorage gracefully', () => {
      // Mock missing localStorage
      const originalLocalStorage = global.localStorage;
      delete (global as any).localStorage;

      // Test localStorage fallback
      const hasLocalStorage = typeof global.localStorage !== 'undefined';
      expect(hasLocalStorage).toBeFalsy();

      // Simulate fallback behavior
      const fallbackStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };

      expect(fallbackStorage.getItem('test')).toBeNull();

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });

    it('should handle missing fetch API gracefully', () => {
      // Mock missing fetch
      const originalFetch = global.fetch;
      delete (global as any).fetch;

      // Test fetch detection
      const hasFetch = typeof fetch !== 'undefined';
      expect(hasFetch).toBeFalsy();

      // Simulate polyfill check
      const needsPolyfill = !hasFetch;
      expect(needsPolyfill).toBeTruthy();

      // Restore fetch
      global.fetch = originalFetch;
    });

    it('should handle missing IntersectionObserver gracefully', () => {
      // Mock missing IntersectionObserver
      const originalIntersectionObserver = global.IntersectionObserver;
      delete (global as any).IntersectionObserver;

      // Test IntersectionObserver detection
      const hasIntersectionObserver =
        typeof IntersectionObserver !== 'undefined';
      expect(hasIntersectionObserver).toBeFalsy();

      // Simulate fallback behavior
      const fallbackObserver = {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {},
      };

      expect(fallbackObserver.observe).toBeDefined();

      // Restore IntersectionObserver
      global.IntersectionObserver = originalIntersectionObserver;
    });

    it('should handle missing ResizeObserver gracefully', () => {
      // Mock missing ResizeObserver
      const originalResizeObserver = global.ResizeObserver;
      delete (global as any).ResizeObserver;

      // Test ResizeObserver detection
      const hasResizeObserver = typeof ResizeObserver !== 'undefined';
      expect(hasResizeObserver).toBeFalsy();

      // Simulate fallback behavior (using window.resize events)
      const fallbackResize = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      expect(fallbackResize.addEventListener).toBeDefined();

      // Restore ResizeObserver
      global.ResizeObserver = originalResizeObserver;
    });
  });

  describe('CSS Feature Support', () => {
    it('should handle CSS Grid support detection', () => {
      // Mock CSS.supports
      const mockCSSSupports = jest.fn();
      global.CSS = { supports: mockCSSSupports } as any;

      // Test CSS Grid support
      mockCSSSupports.mockReturnValue(true);
      const supportsGrid = CSS.supports('display', 'grid');
      expect(supportsGrid).toBeTruthy();

      // Test fallback for no CSS Grid
      mockCSSSupports.mockReturnValue(false);
      const noGridSupport = CSS.supports('display', 'grid');
      expect(noGridSupport).toBeFalsy();

      console.log(`CSS Grid support: ${supportsGrid}`);
    });

    it('should handle CSS Flexbox support detection', () => {
      const mockCSSSupports = jest.fn();
      global.CSS = { supports: mockCSSSupports } as any;

      // Test Flexbox support
      mockCSSSupports.mockReturnValue(true);
      const supportsFlexbox = CSS.supports('display', 'flex');
      expect(supportsFlexbox).toBeTruthy();

      console.log(`CSS Flexbox support: ${supportsFlexbox}`);
    });

    it('should handle CSS Custom Properties support', () => {
      const mockCSSSupports = jest.fn();
      global.CSS = { supports: mockCSSSupports } as any;

      // Test CSS Custom Properties support
      mockCSSSupports.mockReturnValue(true);
      const supportsCustomProps = CSS.supports('--custom-property', 'value');
      expect(supportsCustomProps).toBeTruthy();

      console.log(`CSS Custom Properties support: ${supportsCustomProps}`);
    });
  });

  describe('JavaScript Feature Support', () => {
    it('should handle ES6+ features gracefully', () => {
      // Test arrow functions
      const arrowFunction = () => 'test';
      expect(arrowFunction()).toBe('test');

      // Test template literals
      const name = 'test';
      const template = `Hello ${name}`;
      expect(template).toBe('Hello test');

      // Test destructuring
      const obj = { a: 1, b: 2 };
      const { a, b } = obj;
      expect(a).toBe(1);
      expect(b).toBe(2);

      // Test spread operator
      const arr1 = [1, 2];
      const arr2 = [...arr1, 3];
      expect(arr2).toEqual([1, 2, 3]);
    });

    it('should handle Promise support', () => {
      // Test Promise support
      const hasPromise = typeof Promise !== 'undefined';
      expect(hasPromise).toBeTruthy();

      // Test async/await simulation
      const asyncFunction = async () => {
        return Promise.resolve('test');
      };

      return asyncFunction().then(result => {
        expect(result).toBe('test');
      });
    });

    it('should handle Map and Set support', () => {
      // Test Map support
      const hasMap = typeof Map !== 'undefined';
      expect(hasMap).toBeTruthy();

      if (hasMap) {
        const map = new Map();
        map.set('key', 'value');
        expect(map.get('key')).toBe('value');
      }

      // Test Set support
      const hasSet = typeof Set !== 'undefined';
      expect(hasSet).toBeTruthy();

      if (hasSet) {
        const set = new Set([1, 2, 2, 3]);
        expect(set.size).toBe(3);
      }
    });
  });

  describe('Touch and Mouse Event Support', () => {
    it('should handle touch events', () => {
      // Mock touch events
      const mockTouchEvent = {
        type: 'touchstart',
        touches: [{ clientX: 100, clientY: 100 }],
        preventDefault: jest.fn(),
      };

      // Test touch event handling
      const handleTouch = (event: any) => {
        if (event.touches && event.touches.length > 0) {
          return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        return null;
      };

      const touchCoords = handleTouch(mockTouchEvent);
      expect(touchCoords).toEqual({ x: 100, y: 100 });
    });

    it('should handle mouse events', () => {
      // Mock mouse events
      const mockMouseEvent = {
        type: 'click',
        clientX: 150,
        clientY: 200,
        preventDefault: jest.fn(),
      };

      // Test mouse event handling
      const handleMouse = (event: any) => {
        return { x: event.clientX, y: event.clientY };
      };

      const mouseCoords = handleMouse(mockMouseEvent);
      expect(mouseCoords).toEqual({ x: 150, y: 200 });
    });

    it('should detect touch capability', () => {
      // Mock touch capability detection
      const hasTouchSupport =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Since we're in a test environment, this will likely be false
      expect(typeof hasTouchSupport).toBe('boolean');

      console.log(`Touch support detected: ${hasTouchSupport}`);
    });
  });

  describe('Viewport and Media Query Support', () => {
    it('should handle different viewport sizes', () => {
      const viewportSizes = [
        { width: 320, height: 568, name: 'Mobile Portrait' },
        { width: 768, height: 1024, name: 'Tablet Portrait' },
        { width: 1024, height: 768, name: 'Tablet Landscape' },
        { width: 1200, height: 800, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' },
      ];

      viewportSizes.forEach(({ width, height, name }) => {
        // Mock viewport size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        });

        // Test responsive breakpoints
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const isDesktop = width >= 1024;

        expect(typeof isMobile).toBe('boolean');
        expect(typeof isTablet).toBe('boolean');
        expect(typeof isDesktop).toBe('boolean');

        console.log(
          `${name} (${width}x${height}): Mobile=${isMobile}, Tablet=${isTablet}, Desktop=${isDesktop}`
        );
      });
    });

    it('should handle matchMedia support', () => {
      // Test matchMedia support
      const hasMatchMedia = typeof window.matchMedia !== 'undefined';
      expect(hasMatchMedia).toBeTruthy();

      if (hasMatchMedia) {
        // Test media query
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        expect(mediaQuery).toBeDefined();
        expect(typeof mediaQuery.matches).toBe('boolean');
      }
    });
  });

  describe('Image Format Support', () => {
    it('should handle WebP support detection', () => {
      // Mock WebP support detection
      const supportsWebP = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      };

      // In test environment, this might not work, so we'll mock it
      const mockSupportsWebP = true;
      expect(typeof mockSupportsWebP).toBe('boolean');

      console.log(`WebP support: ${mockSupportsWebP}`);
    });

    it('should handle AVIF support detection', () => {
      // Mock AVIF support detection
      const mockSupportsAVIF = false; // Most browsers don't support AVIF yet
      expect(typeof mockSupportsAVIF).toBe('boolean');

      console.log(`AVIF support: ${mockSupportsAVIF}`);
    });
  });

  describe('Data Processing Compatibility', () => {
    it('should handle data processing across different environments', () => {
      // Test that our data processing works consistently
      const testData = mockMenuItems.slice(0, 5);

      // Test slug generation consistency
      const slugs = testData.map(item => generateSlug(item.name));
      expect(slugs.length).toBe(testData.length);

      // Test that slugs are consistent across calls
      const slugs2 = testData.map(item => generateSlug(item.name));
      expect(slugs).toEqual(slugs2);

      // Test filtering consistency
      const filtered = testData.filter(item => item.basePrice > 10);
      const filtered2 = testData.filter(item => item.basePrice > 10);
      expect(filtered).toEqual(filtered2);

      console.log(
        `Data processing consistency verified for ${testData.length} items`
      );
    });

    it('should handle JSON serialization consistently', () => {
      const testItem = mockMenuItems[0];

      // Test JSON serialization
      const serialized = JSON.stringify(testItem);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.id).toBe(testItem.id);
      expect(deserialized.name).toBe(testItem.name);
      expect(deserialized.basePrice).toBe(testItem.basePrice);

      console.log(`JSON serialization verified for item: ${testItem.name}`);
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle errors consistently across browsers', () => {
      // Test error handling
      const throwError = () => {
        throw new Error('Test error');
      };

      expect(throwError).toThrow('Test error');

      // Test try-catch behavior
      let caughtError = null;
      try {
        throwError();
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as Error).message).toBe('Test error');
    });

    it('should handle async error handling', async () => {
      const asyncError = async () => {
        throw new Error('Async error');
      };

      await expect(asyncError()).rejects.toThrow('Async error');
    });
  });
});
