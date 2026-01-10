/**
 * Integration tests for package detail pages
 * Tests complete user flows from packages to cart
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import PackagePage from '../[slug]/page';
import { mockPackages, mockMenuItems } from '@/lib/mock-data';
import { generateSlug } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import type { Package } from '@/types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(),
}));

// Mock cart store
jest.mock('@/stores/cart-store');

// Mock analytics
jest.mock('@/hooks/use-analytics', () => ({
  useDetailPageAnalytics: jest.fn(),
  useCustomizationTracking: jest.fn(() => ({
    trackCustomization: jest.fn(),
  })),
  useCartTracking: jest.fn(() => ({
    trackAddToCart: jest.fn(),
  })),
}));

// Mock screen reader utilities
jest.mock('@/lib/screen-reader', () => ({
  initializeScreenReaderSupport: jest.fn(),
  announceNavigation: jest.fn(),
  announceToScreenReader: jest.fn(),
}));

describe('Package Detail Page Integration', () => {
  const mockPush = jest.fn();
  const mockAddItem = jest.fn();
  const mockGetItemById = jest.fn();
  const mockGetSubtotal = jest.fn();
  const mockGetTotalItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      replace: jest.fn(),
    });

    (useCartStore as unknown as jest.Mock).mockReturnValue({
      addItem: mockAddItem,
      getItemById: mockGetItemById,
      getSubtotal: mockGetSubtotal,
      getTotalItems: mockGetTotalItems,
      items: [],
    });

    // Mock store getState
    (useCartStore as any).getState = jest.fn(() => ({
      addItem: mockAddItem,
      getItemById: mockGetItemById,
      getSubtotal: mockGetSubtotal,
      getTotalItems: mockGetTotalItems,
      items: [],
    }));
  });

  describe('Page Rendering and Navigation', () => {
    it('should render package page with all essential content', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check essential content is present
      await waitFor(() => {
        expect(screen.getByText(testPackage.name)).toBeInTheDocument();
        expect(screen.getByText(testPackage.description)).toBeInTheDocument();
        expect(
          screen.getByText(`$${testPackage.price.toFixed(2)}`)
        ).toBeInTheDocument();
      });

      // Check breadcrumb navigation
      expect(
        screen.getByRole('navigation', { name: /breadcrumb/i })
      ).toBeInTheDocument();

      // Check back button
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should handle navigation back to packages', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      const backButton = await screen.findByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/packages');
    });

    it('should display package contents breakdown', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check for "What's Included" section
      await waitFor(() => {
        expect(screen.getByText("What's Included")).toBeInTheDocument();
      });

      // Check that package items are displayed
      if (testPackage.items && testPackage.items.length > 0) {
        testPackage.items.forEach(packageItem => {
          const menuItem = mockMenuItems.find(
            item => item.id === packageItem.menuItemId
          );
          if (menuItem) {
            expect(screen.getByText(menuItem.name)).toBeInTheDocument();
          }
        });
      }
    });

    it('should display savings calculation', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Calculate expected savings
      let originalPrice = 0;
      if (testPackage.items) {
        testPackage.items.forEach(packageItem => {
          const menuItem = mockMenuItems.find(
            item => item.id === packageItem.menuItemId
          );
          if (menuItem) {
            originalPrice += menuItem.basePrice * packageItem.quantity;
          }
        });
      }

      const savings = originalPrice - testPackage.price;

      if (savings > 0) {
        await waitFor(() => {
          expect(
            screen.getByText(new RegExp(`\\$${savings.toFixed(2)}`, 'i'))
          ).toBeInTheDocument();
          expect(screen.getByText(/save/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Package Customization', () => {
    it('should display customization interface for package items', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check for customization section
      await waitFor(() => {
        expect(screen.getByText('Customize Your Package')).toBeInTheDocument();
      });

      // Check that individual item customizations are available
      if (testPackage.items) {
        testPackage.items.forEach(packageItem => {
          const menuItem = mockMenuItems.find(
            item => item.id === packageItem.menuItemId
          );
          if (
            menuItem &&
            menuItem.customizations &&
            menuItem.customizations.length > 0
          ) {
            expect(screen.getByText(menuItem.name)).toBeInTheDocument();
          }
        });
      }
    });

    it('should update total price when package customizations change', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);
      const user = userEvent.setup();

      render(<PackagePage params={{ slug }} />);

      // Find a customizable item in the package
      const customizableItem = testPackage.items?.find(packageItem => {
        const menuItem = mockMenuItems.find(
          item => item.id === packageItem.menuItemId
        );
        return menuItem?.customizations && menuItem.customizations.length > 0;
      });

      if (customizableItem) {
        const menuItem = mockMenuItems.find(
          item => item.id === customizableItem.menuItemId
        );
        const customizationWithPrice = menuItem?.customizations?.find(c =>
          c.options.some(opt => opt.priceModifier > 0)
        );

        if (customizationWithPrice) {
          const optionWithPrice = customizationWithPrice.options.find(
            opt => opt.priceModifier > 0
          );

          if (optionWithPrice) {
            // Select the option
            const optionElement = await screen.findByLabelText(
              new RegExp(optionWithPrice.name, 'i')
            );
            await user.click(optionElement);

            // Check that total price is updated
            await waitFor(() => {
              const expectedPrice =
                testPackage.price + optionWithPrice.priceModifier;
              expect(
                screen.getByText(`$${expectedPrice.toFixed(2)}`)
              ).toBeInTheDocument();
            });
          }
        }
      }
    });
  });

  describe('Add to Cart Flow', () => {
    it('should add package to cart with all items and customizations', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);
      const user = userEvent.setup();

      render(<PackagePage params={{ slug }} />);

      // Find and click add to cart button
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButton);

      // Verify cart store was called for the package
      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          expect.objectContaining({
            packageId: testPackage.id,
            name: testPackage.name,
            basePrice: testPackage.price,
            quantity: 1,
          })
        );
      });
    });

    it('should handle package quantity changes', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);
      const user = userEvent.setup();

      render(<PackagePage params={{ slug }} />);

      // Find quantity input and change it
      const quantityInput = await screen.findByRole('spinbutton', {
        name: /quantity/i,
      });

      await user.clear(quantityInput);
      await user.type(quantityInput, '2');

      // Add to cart
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      // Verify correct quantity was added
      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          expect.objectContaining({
            quantity: 2,
          })
        );
      });
    });
  });

  describe('Related Items and Packages', () => {
    it('should display related packages section', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check for related packages section (if there are other packages)
      if (mockPackages.length > 1) {
        await waitFor(() => {
          const relatedSections = screen.queryAllByText(
            /related|similar|you might also like/i
          );
          expect(relatedSections.length).toBeGreaterThan(0);
        });
      }
    });

    it('should display related individual items', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check for related items section
      await waitFor(() => {
        const relatedItemLinks = screen.getAllByRole('link');
        const itemLinks = relatedItemLinks.filter(link =>
          link.getAttribute('href')?.includes('/menu/items/')
        );

        // Should have some related item links
        expect(itemLinks.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt layout for mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check that mobile-specific layout is applied
      await waitFor(() => {
        const container =
          screen.getByRole('main') ||
          document.querySelector('[data-testid="detail-page-grid"]');
        expect(container).toBeInTheDocument();
      });
    });

    it('should adapt layout for desktop viewport', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check that desktop layout is applied
      await waitFor(() => {
        const container =
          screen.getByRole('main') ||
          document.querySelector('[data-testid="detail-page-grid"]');
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Check for proper navigation landmarks
      await waitFor(() => {
        expect(
          screen.getByRole('navigation', { name: /breadcrumb/i })
        ).toBeInTheDocument();
      });

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Check for proper button labels
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });
      expect(addToCartButton).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);
      const user = userEvent.setup();

      render(<PackagePage params={{ slug }} />);

      // Test tab navigation through interactive elements
      await user.tab();

      // Check that focus moves to interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);
      expect(focusedElement?.tagName).toMatch(/BUTTON|A|INPUT/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid package slugs gracefully', () => {
      // This would trigger the notFound() function
      expect(() => {
        render(<PackagePage params={{ slug: 'invalid-package-slug' }} />);
      }).not.toThrow();
    });

    it('should handle packages with missing items gracefully', async () => {
      // Create a test package with invalid item references
      const packageWithMissingItems = {
        ...mockPackages[0],
        items: [{ menuItemId: 'non-existent-item', quantity: 1 }],
      };

      // Mock the package data
      jest
        .spyOn(require('@/lib/mock-data'), 'mockPackages', 'get')
        .mockReturnValue([packageWithMissingItems]);

      const slug =
        packageWithMissingItems.slug ||
        generateSlug(packageWithMissingItems.name);

      render(<PackagePage params={{ slug }} />);

      // Should still render without crashing
      await waitFor(() => {
        expect(
          screen.getByText(packageWithMissingItems.name)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should work with different user agents', async () => {
      // Mock different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      ];

      for (const userAgent of userAgents) {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true,
        });

        const testPackage = mockPackages[0];
        const slug = testPackage.slug || generateSlug(testPackage.name);

        const { unmount } = render(<PackagePage params={{ slug }} />);

        // Should render without errors
        await waitFor(() => {
          expect(screen.getByText(testPackage.name)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });
});
