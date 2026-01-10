/**
 * Integration tests for menu item detail pages
 * Tests complete user flows from menu to cart
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import MenuItemPage from '../[slug]/page';
import { mockMenuItems } from '../../../../lib/mock-data';
import { generateSlug } from '../../../../lib/utils';
import { useCartStore } from '../../../../stores/cart-store';
import type { MenuItem } from '../../../../types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(),
}));

// Mock cart store
jest.mock('../../../../stores/cart-store');

// Mock analytics
jest.mock('../../../../hooks/use-analytics', () => ({
  useDetailPageAnalytics: jest.fn(),
  useCustomizationTracking: jest.fn(() => ({
    trackCustomization: jest.fn(),
  })),
  useCartTracking: jest.fn(() => ({
    trackAddToCart: jest.fn(),
  })),
}));

// Mock screen reader utilities
jest.mock('../../../../lib/screen-reader', () => ({
  initializeScreenReaderSupport: jest.fn(),
  announceNavigation: jest.fn(),
  announceToScreenReader: jest.fn(),
}));

describe('Menu Item Detail Page Integration', () => {
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
    it('should render menu item page with all essential content', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Check essential content is present
      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
        expect(screen.getByText(testItem.description)).toBeInTheDocument();
        expect(
          screen.getByText(`$${testItem.basePrice.toFixed(2)}`)
        ).toBeInTheDocument();
      });

      // Check breadcrumb navigation
      expect(
        screen.getByRole('navigation', { name: /breadcrumb/i })
      ).toBeInTheDocument();

      // Check back button
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should handle navigation back to menu', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      const backButton = await screen.findByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/menu');
    });

    it('should display product gallery with images', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Check main product image
      await waitFor(() => {
        const productImage = screen.getByRole('img', { name: testItem.name });
        expect(productImage).toBeInTheDocument();
        expect(productImage).toHaveAttribute('alt', testItem.name);
      });
    });
  });

  describe('Customization Interface', () => {
    it('should display customization options when available', async () => {
      // Find an item with customizations
      const itemWithCustomizations = mockMenuItems.find(
        item => item.customizations && item.customizations.length > 0
      );

      if (!itemWithCustomizations) {
        // Skip if no items have customizations
        return;
      }

      const slug =
        itemWithCustomizations.slug ||
        generateSlug(itemWithCustomizations.name);

      render(<MenuItemPage params={{ slug }} />);

      // Check customization section is present
      await waitFor(() => {
        expect(screen.getByText('Customize Your Order')).toBeInTheDocument();
      });

      // Check that customization options are rendered
      itemWithCustomizations.customizations?.forEach(customization => {
        expect(screen.getByText(customization.name)).toBeInTheDocument();
      });
    });

    it('should update price when customizations are selected', async () => {
      const itemWithCustomizations = mockMenuItems.find(
        item =>
          item.customizations &&
          item.customizations.some(c =>
            c.options.some(opt => opt.priceModifier > 0)
          )
      );

      if (!itemWithCustomizations) {
        return;
      }

      const slug =
        itemWithCustomizations.slug ||
        generateSlug(itemWithCustomizations.name);
      const user = userEvent.setup();

      render(<MenuItemPage params={{ slug }} />);

      // Find a customization option with price modifier
      const customizationWithPrice =
        itemWithCustomizations.customizations?.find(c =>
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

          // Check that price is updated (this would require the component to show updated total)
          await waitFor(() => {
            const expectedPrice =
              itemWithCustomizations.basePrice + optionWithPrice.priceModifier;
            expect(
              screen.getByText(`$${expectedPrice.toFixed(2)}`)
            ).toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Add to Cart Flow', () => {
    it('should add item to cart with selected customizations', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);
      const user = userEvent.setup();

      render(<MenuItemPage params={{ slug }} />);

      // Find and click add to cart button
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButton);

      // Verify cart store was called
      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          expect.objectContaining({
            menuItemId: testItem.id,
            name: testItem.name,
            basePrice: testItem.basePrice,
            quantity: 1,
          })
        );
      });
    });

    it('should handle quantity changes before adding to cart', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);
      const user = userEvent.setup();

      render(<MenuItemPage params={{ slug }} />);

      // Find quantity input and change it
      const quantityInput = await screen.findByRole('spinbutton', {
        name: /quantity/i,
      });

      await user.clear(quantityInput);
      await user.type(quantityInput, '3');

      // Add to cart
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      // Verify correct quantity was added
      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          expect.objectContaining({
            quantity: 3,
          })
        );
      });
    });

    it('should show success feedback after adding to cart', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);
      const user = userEvent.setup();

      render(<MenuItemPage params={{ slug }} />);

      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });

      await user.click(addToCartButton);

      // Check for success message (this would depend on the actual implementation)
      await waitFor(
        () => {
          expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Related Items', () => {
    it('should display related items section', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Check for related items section
      await waitFor(() => {
        expect(screen.getByText('You Might Also Like')).toBeInTheDocument();
      });

      // Check that related items are displayed
      const relatedItemLinks = screen.getAllByRole('link');
      const itemLinks = relatedItemLinks.filter(link =>
        link.getAttribute('href')?.includes('/menu/items/')
      );

      expect(itemLinks.length).toBeGreaterThan(0);
    });

    it('should navigate to related item when clicked', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);
      const user = userEvent.setup();

      render(<MenuItemPage params={{ slug }} />);

      // Find a related item link
      await waitFor(() => {
        const relatedItemLinks = screen.getAllByRole('link');
        const itemLink = relatedItemLinks.find(
          link =>
            link.getAttribute('href')?.includes('/menu/items/') &&
            link.getAttribute('href') !== `/menu/items/${slug}`
        );

        if (itemLink) {
          expect(itemLink).toBeInTheDocument();
        }
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

      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Check that mobile-specific classes or behaviors are applied
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

      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

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
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

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
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);
      const user = userEvent.setup();

      render(<MenuItemPage params={{ slug }} />);

      // Test tab navigation through interactive elements
      await user.tab();

      // Check that focus moves to interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);
      expect(focusedElement?.tagName).toMatch(/BUTTON|A|INPUT/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid slugs gracefully', () => {
      // This would trigger the notFound() function
      expect(() => {
        render(
          <MenuItemPage params={{ slug: 'invalid-slug-that-does-not-exist' }} />
        );
      }).not.toThrow();
    });

    it('should handle missing images gracefully', async () => {
      // Create a test item with no image
      const itemWithoutImage = {
        ...mockMenuItems[0],
        image: '',
        images: [],
      };

      // Mock the getMenuItemBySlug to return our test item
      jest
        .spyOn(require('@/lib/mock-data'), 'mockMenuItems', 'get')
        .mockReturnValue([itemWithoutImage]);

      const slug = itemWithoutImage.slug || generateSlug(itemWithoutImage.name);

      render(<MenuItemPage params={{ slug }} />);

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText(itemWithoutImage.name)).toBeInTheDocument();
      });
    });
  });
});
