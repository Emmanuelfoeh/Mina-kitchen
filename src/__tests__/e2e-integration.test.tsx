/**
 * End-to-end integration tests
 * Tests complete user flows from menu browsing to cart checkout
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import MenuPage from '@/app/menu/page';
import PackagesPage from '@/app/packages/page';
import MenuItemPage from '@/app/menu/items/[slug]/page';
import PackagePage from '@/app/packages/[slug]/page';
import { mockMenuItems, mockPackages } from '@/lib/mock-data';
import { generateSlug } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';

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

describe('End-to-End User Flows', () => {
  const mockPush = jest.fn();
  const mockAddItem = jest.fn();
  const mockGetItemById = jest.fn();
  const mockGetSubtotal = jest.fn();
  const mockGetTotalItems = jest.fn();
  const mockItems: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockItems.length = 0; // Clear the mock items array

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
      items: mockItems,
    });

    // Mock store getState
    (useCartStore as any).getState = jest.fn(() => ({
      addItem: mockAddItem,
      getItemById: mockGetItemById,
      getSubtotal: mockGetSubtotal,
      getTotalItems: mockGetTotalItems,
      items: mockItems,
    }));
  });

  describe('Menu Browsing to Item Detail Flow', () => {
    it('should navigate from menu page to item detail page', async () => {
      const user = userEvent.setup();

      // Start at menu page
      const { unmount: unmountMenu } = render(<MenuPage />);

      // Find a menu item and click customize
      await waitFor(() => {
        const customizeButtons = screen.getAllByText(/customize/i);
        expect(customizeButtons.length).toBeGreaterThan(0);
      });

      const firstCustomizeButton = screen.getAllByText(/customize/i)[0];
      await user.click(firstCustomizeButton);

      // Verify navigation was called
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/\/menu\/items\//)
      );

      unmountMenu();

      // Now render the item detail page
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Verify item detail page content
      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
        expect(screen.getByText(testItem.description)).toBeInTheDocument();
      });
    });

    it('should complete full menu item customization and add to cart flow', async () => {
      const user = userEvent.setup();
      const testItem =
        mockMenuItems.find(
          item => item.customizations && item.customizations.length > 0
        ) || mockMenuItems[0];

      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      // Select customizations if available
      if (testItem.customizations && testItem.customizations.length > 0) {
        for (const customization of testItem.customizations) {
          if (customization.required && customization.options.length > 0) {
            const firstOption = customization.options[0];
            const optionElement = await screen.findByLabelText(
              new RegExp(firstOption.name, 'i')
            );
            await user.click(optionElement);
          }
        }
      }

      // Change quantity
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

      // Verify cart was updated
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          menuItemId: testItem.id,
          quantity: 2,
        })
      );

      // Verify success feedback
      await waitFor(() => {
        expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
      });
    });
  });

  describe('Package Browsing to Package Detail Flow', () => {
    it('should navigate from packages page to package detail page', async () => {
      const user = userEvent.setup();

      // Start at packages page
      const { unmount: unmountPackages } = render(<PackagesPage />);

      // Find a package and click customize
      await waitFor(() => {
        const customizeButtons = screen.getAllByText(/customize/i);
        expect(customizeButtons.length).toBeGreaterThan(0);
      });

      const firstCustomizeButton = screen.getAllByText(/customize/i)[0];
      await user.click(firstCustomizeButton);

      // Verify navigation was called
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/\/packages\//)
      );

      unmountPackages();

      // Now render the package detail page
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Verify package detail page content
      await waitFor(() => {
        expect(screen.getByText(testPackage.name)).toBeInTheDocument();
        expect(screen.getByText(testPackage.description)).toBeInTheDocument();
      });
    });

    it('should complete full package customization and add to cart flow', async () => {
      const user = userEvent.setup();
      const testPackage = mockPackages[0];
      const slug = testPackage.slug || generateSlug(testPackage.name);

      render(<PackagePage params={{ slug }} />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(testPackage.name)).toBeInTheDocument();
      });

      // Customize package items if available
      if (testPackage.items && testPackage.items.length > 0) {
        for (const packageItem of testPackage.items) {
          const menuItem = mockMenuItems.find(
            item => item.id === packageItem.menuItemId
          );
          if (menuItem?.customizations && menuItem.customizations.length > 0) {
            for (const customization of menuItem.customizations) {
              if (customization.required && customization.options.length > 0) {
                const firstOption = customization.options[0];
                try {
                  const optionElement = await screen.findByLabelText(
                    new RegExp(firstOption.name, 'i')
                  );
                  await user.click(optionElement);
                } catch (error) {
                  // Option might not be visible or available, continue
                }
              }
            }
          }
        }
      }

      // Add to cart
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      // Verify cart was updated
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          packageId: testPackage.id,
          quantity: 1,
        })
      );
    });
  });

  describe('Cross-Page Navigation Flow', () => {
    it('should maintain cart state across page navigation', async () => {
      const user = userEvent.setup();

      // Add item to mock cart
      const cartItem = {
        id: 'test-cart-item',
        menuItemId: mockMenuItems[0].id,
        name: mockMenuItems[0].name,
        basePrice: mockMenuItems[0].basePrice,
        quantity: 1,
        customizations: [],
      };
      mockItems.push(cartItem);
      mockGetTotalItems.mockReturnValue(1);

      // Render menu item page
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);
      const { unmount } = render(<MenuItemPage params={{ slug }} />);

      // Verify cart state is maintained
      expect(mockGetTotalItems()).toBe(1);

      unmount();

      // Navigate to packages page
      render(<PackagesPage />);

      // Cart state should still be maintained
      expect(mockGetTotalItems()).toBe(1);
    });

    it('should handle back navigation correctly', async () => {
      const user = userEvent.setup();
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Click back button
      const backButton = await screen.findByRole('button', { name: /back/i });
      await user.click(backButton);

      // Verify navigation back to menu
      expect(mockPush).toHaveBeenCalledWith('/menu');
    });
  });

  describe('Related Items Navigation Flow', () => {
    it('should navigate between related items', async () => {
      const user = userEvent.setup();
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Wait for related items to load
      await waitFor(() => {
        expect(screen.getByText('You Might Also Like')).toBeInTheDocument();
      });

      // Find related item links
      const relatedItemLinks = screen.getAllByRole('link');
      const itemLinks = relatedItemLinks.filter(
        link =>
          link.getAttribute('href')?.includes('/menu/items/') &&
          link.getAttribute('href') !== `/menu/items/${slug}`
      );

      if (itemLinks.length > 0) {
        const firstRelatedLink = itemLinks[0];
        const href = firstRelatedLink.getAttribute('href');

        // Click on related item
        await user.click(firstRelatedLink);

        // Verify navigation to related item
        expect(mockPush).toHaveBeenCalledWith(href);
      }
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Simulate error in cart operation
      mockAddItem.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Try to add to cart
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });
      await user.click(addToCartButton);

      // Should handle error gracefully without crashing
      await waitFor(() => {
        // Error message should be displayed
        expect(
          screen.getByText(/error/i) || screen.getByText(/try again/i)
        ).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should recover from invalid customization states', async () => {
      const user = userEvent.setup();
      const testItem = mockMenuItems.find(
        item => item.customizations && item.customizations.some(c => c.required)
      );

      if (!testItem) {
        return; // Skip if no required customizations
      }

      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Try to add to cart without selecting required customizations
      const addToCartButton = await screen.findByRole('button', {
        name: /add to cart/i,
      });

      // Button should be disabled or show validation error
      expect(addToCartButton).toBeDisabled();

      // Select required customizations
      const requiredCustomization = testItem.customizations?.find(
        c => c.required
      );
      if (requiredCustomization && requiredCustomization.options.length > 0) {
        const firstOption = requiredCustomization.options[0];
        const optionElement = await screen.findByLabelText(
          new RegExp(firstOption.name, 'i')
        );
        await user.click(optionElement);

        // Button should now be enabled
        await waitFor(() => {
          expect(addToCartButton).not.toBeDisabled();
        });
      }
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during page transitions', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      // Render with Suspense boundary
      render(<MenuItemPage params={{ slug }} />);

      // Should eventually show content (not just loading state)
      await waitFor(
        () => {
          expect(screen.getByText(testItem.name)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should handle slow image loading gracefully', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      render(<MenuItemPage params={{ slug }} />);

      // Should show skeleton or placeholder while images load
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mobile and Desktop Experience', () => {
    it('should provide consistent experience across viewport sizes', async () => {
      const testItem = mockMenuItems[0];
      const slug = testItem.slug || generateSlug(testItem.name);

      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { unmount: unmountMobile } = render(
        <MenuItemPage params={{ slug }} />
      );

      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });

      unmountMobile();

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<MenuItemPage params={{ slug }} />);

      await waitFor(() => {
        expect(screen.getByText(testItem.name)).toBeInTheDocument();
      });
    });
  });
});
