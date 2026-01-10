/**
 * Analytics system tests
 */

import {
  trackPageView,
  trackCustomizationSelection,
  trackCartConversion,
  trackUserBehavior,
  getAnalyticsConfig,
} from '../analytics';

// Mock window and document for tests
const mockWindow = {
  dataLayer: [],
  gtag: jest.fn(),
  location: {
    href: 'http://localhost:3000/menu/items/test-item',
    pathname: '/menu/items/test-item',
  },
  performance: {
    now: () => Date.now(),
  },
  navigator: {
    sendBeacon: jest.fn(),
    userAgent: 'test-agent',
  },
};

const mockDocument = {
  title: 'Test Item - AfroEats',
};

// Mock globals
(global as any).window = mockWindow;
(global as any).document = mockDocument;

describe('Analytics System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.dataLayer = [];
  });

  describe('Configuration', () => {
    it('should return analytics configuration', () => {
      const config = getAnalyticsConfig();
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('debug');
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views with correct data', () => {
      const pageData = {
        page_title: 'Test Item - AfroEats',
        page_location: 'http://localhost:3000/menu/items/test-item',
        page_path: '/menu/items/test-item',
        content_group1: 'menu',
        content_group2: 'item_detail',
      };

      trackPageView(pageData);

      // In development mode, this should work without errors
      expect(() => trackPageView(pageData)).not.toThrow();
    });

    it('should handle page view tracking with minimal data', () => {
      const pageData = {
        page_title: 'Home',
        page_location: 'http://localhost:3000',
        page_path: '/',
      };

      expect(() => trackPageView(pageData)).not.toThrow();
    });
  });

  describe('Customization Tracking', () => {
    it('should track customization selections', () => {
      const customizationData = {
        item_id: 'item-123',
        item_name: 'Jollof Rice',
        item_category: 'Main Dishes',
        customization_type: 'radio' as const,
        customization_name: 'Spice Level',
        selected_option: 'Medium',
        price_modifier: 0,
        total_customizations: 1,
      };

      expect(() =>
        trackCustomizationSelection(customizationData)
      ).not.toThrow();
    });

    it('should handle customization tracking with price modifiers', () => {
      const customizationData = {
        item_id: 'item-456',
        item_name: 'Grilled Chicken',
        item_category: 'Proteins',
        customization_type: 'checkbox' as const,
        customization_name: 'Add-ons',
        selected_option: 'Extra Sauce',
        price_modifier: 2.5,
        total_customizations: 2,
      };

      expect(() =>
        trackCustomizationSelection(customizationData)
      ).not.toThrow();
    });
  });

  describe('Cart Conversion Tracking', () => {
    it('should track cart conversions', () => {
      const conversionData = {
        item_id: 'item-789',
        item_name: 'Plantain Chips',
        item_category: 'Sides',
        quantity: 2,
        unit_price: 8.99,
        total_price: 17.98,
        customizations_count: 1,
        has_special_instructions: false,
        conversion_source: 'detail_page' as const,
      };

      expect(() => trackCartConversion(conversionData)).not.toThrow();
    });

    it('should handle cart conversion with special instructions', () => {
      const conversionData = {
        item_id: 'item-101',
        item_name: 'Egusi Soup',
        item_category: 'Soups',
        quantity: 1,
        unit_price: 15.99,
        total_price: 15.99,
        customizations_count: 3,
        has_special_instructions: true,
        conversion_source: 'related_items' as const,
      };

      expect(() => trackCartConversion(conversionData)).not.toThrow();
    });
  });

  describe('User Behavior Tracking', () => {
    it('should track engagement events', () => {
      const behaviorData = {
        event_type: 'engagement' as const,
        page_path: '/menu/items/test-item',
        engagement_time: 45000,
        scroll_depth: 75,
      };

      expect(() => trackUserBehavior(behaviorData)).not.toThrow();
    });

    it('should track exit point events', () => {
      const behaviorData = {
        event_type: 'exit_point' as const,
        page_path: '/menu/items/test-item',
        engagement_time: 30000,
        scroll_depth: 50,
        exit_element: 'back_button',
      };

      expect(() => trackUserBehavior(behaviorData)).not.toThrow();
    });

    it('should track performance events', () => {
      const behaviorData = {
        event_type: 'performance' as const,
        page_path: '/menu/items/test-item',
        performance_metric: 'LCP',
        performance_value: 2500,
      };

      expect(() => trackUserBehavior(behaviorData)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing window object gracefully', () => {
      // Temporarily remove window
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const pageData = {
        page_title: 'Test',
        page_location: 'http://localhost:3000',
        page_path: '/',
      };

      expect(() => trackPageView(pageData)).not.toThrow();

      // Restore window
      (global as any).window = originalWindow;
    });

    it('should handle invalid data gracefully', () => {
      const invalidData = {
        item_id: '',
        item_name: '',
        item_category: '',
        customization_type: 'invalid' as any,
        customization_name: '',
        price_modifier: NaN,
        total_customizations: -1,
      };

      expect(() => trackCustomizationSelection(invalidData)).not.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should handle edge cases in tracking data', () => {
      // Test with very long strings
      const longString = 'a'.repeat(1000);
      const pageData = {
        page_title: longString,
        page_location: `http://localhost:3000/${longString}`,
        page_path: `/${longString}`,
      };

      expect(() => trackPageView(pageData)).not.toThrow();
    });

    it('should handle special characters in tracking data', () => {
      const specialCharsData = {
        item_id: 'item-123',
        item_name: 'Jollof Rice & Chicken (Spicy) 🌶️',
        item_category: 'Main Dishes / Combos',
        customization_type: 'text' as const,
        customization_name: 'Special Instructions',
        selected_option: 'Extra spicy, no onions! @#$%^&*()',
        price_modifier: 0,
        total_customizations: 1,
      };

      expect(() => trackCustomizationSelection(specialCharsData)).not.toThrow();
    });
  });
});
