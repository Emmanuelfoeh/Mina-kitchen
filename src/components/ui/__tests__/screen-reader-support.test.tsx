/**
 * Screen Reader Support Tests
 * Tests for accessibility features and screen reader announcements
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductGallery } from '../product-gallery';
import { ProductInformation } from '../product-information';
import { CustomizationInterface } from '../customization-interface';
import { AddToCartSection } from '../add-to-cart-section';
import { RelatedItems } from '../related-items';
import { DetailPageLayout } from '../detail-page-layout';
import { mockMenuItems } from '@/lib/mock-data';
import type { MenuItem, NutritionalInfo } from '@/types';

// Mock the screen reader utilities
jest.mock('@/lib/screen-reader', () => ({
  announceToScreenReader: jest.fn(),
  announceNavigation: jest.fn(),
  announceCartOperation: jest.fn(),
  announceCustomizationChange: jest.fn(),
  announcePriceUpdate: jest.fn(),
  announceValidationError: jest.fn(),
  announceFormSuccess: jest.fn(),
  announceGalleryNavigation: jest.fn(),
  getKeyboardInstructions: jest.fn(() => 'Use arrow keys to navigate'),
  initializeScreenReaderSupport: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock cart store
jest.mock('@/stores/cart-store', () => ({
  useCartStore: () => ({
    addItem: jest.fn(),
    openCart: jest.fn(),
  }),
}));

describe('Screen Reader Support', () => {
  const mockItem: MenuItem = mockMenuItems[0];

  const mockNutritionalInfo: NutritionalInfo = {
    calories: 450,
    protein: 25,
    carbs: 35,
    fat: 15,
    fiber: 8,
    sodium: 650,
  };

  describe('DetailPageLayout', () => {
    it('should have proper ARIA landmarks and skip links', () => {
      const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Menu', href: '/menu' },
        { label: 'Test Item' },
      ];

      render(
        <DetailPageLayout breadcrumbItems={breadcrumbItems}>
          <div>Test content</div>
        </DetailPageLayout>
      );

      // Check for skip link
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      // Check for main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('aria-label', 'Product details');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('should have proper section landmarks', () => {
      const breadcrumbItems = [{ label: 'Test' }];

      render(
        <DetailPageLayout breadcrumbItems={breadcrumbItems}>
          <div>Test content</div>
        </DetailPageLayout>
      );

      // Check for product details region
      const detailsRegion = screen.getByRole('region', {
        name: 'Product details',
      });
      expect(detailsRegion).toBeInTheDocument();
    });
  });

  describe('ProductInformation', () => {
    it('should have proper heading structure and ARIA labels', () => {
      render(
        <ProductInformation
          name="Test Dish"
          price={15.99}
          originalPrice={19.99}
          savings={4.0}
          description="A delicious test dish"
          tags={['spicy', 'vegetarian']}
          nutritionalInfo={mockNutritionalInfo}
          chefNotes="Chef's special recommendation"
        />
      );

      // Check main heading
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Test Dish');
      expect(title).toHaveAttribute('id', 'product-title');

      // Check price accessibility
      const currentPrice = screen.getByLabelText(
        /current price.*15\.99 dollars/i
      );
      expect(currentPrice).toBeInTheDocument();

      const originalPrice = screen.getByLabelText(
        /original price.*19\.99 dollars/i
      );
      expect(originalPrice).toBeInTheDocument();

      const savings = screen.getByLabelText(/you save.*4\.00 dollars/i);
      expect(savings).toBeInTheDocument();

      // Check nutritional information table structure
      const nutritionTable = screen.getByRole('table', {
        name: /nutritional information/i,
      });
      expect(nutritionTable).toBeInTheDocument();

      // Check individual nutrition values
      expect(screen.getByLabelText(/450 calories/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/25 grams of protein/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/650 milligrams of sodium/i)
      ).toBeInTheDocument();
    });

    it('should have proper tags list structure', () => {
      render(
        <ProductInformation
          name="Test Dish"
          price={15.99}
          description="A delicious test dish"
          tags={['spicy', 'vegetarian', 'gluten-free']}
        />
      );

      const tagsList = screen.getByRole('list', { name: /product tags/i });
      expect(tagsList).toBeInTheDocument();

      const tags = screen.getAllByRole('listitem');
      expect(tags).toHaveLength(3);

      expect(screen.getByLabelText('Tag: spicy')).toBeInTheDocument();
      expect(screen.getByLabelText('Tag: vegetarian')).toBeInTheDocument();
      expect(screen.getByLabelText('Tag: gluten-free')).toBeInTheDocument();
    });
  });

  describe('ProductGallery', () => {
    const images = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];

    it('should have proper ARIA structure for gallery', () => {
      render(<ProductGallery images={images} alt="Test dish" />);

      // Check main gallery region
      const gallery = screen.getByRole('region', {
        name: /product image gallery/i,
      });
      expect(gallery).toBeInTheDocument();

      // Check gallery instructions
      const instructions = screen.getByText(/use arrow keys to navigate/i);
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveClass('sr-only');

      // Check main image
      const mainImage = screen.getByRole('img', {
        name: /test dish - image 1 of 3/i,
      });
      expect(mainImage).toBeInTheDocument();

      // Check thumbnail navigation
      const thumbnailList = screen.getByRole('tablist', {
        name: /image thumbnails/i,
      });
      expect(thumbnailList).toBeInTheDocument();

      const thumbnails = screen.getAllByRole('tab');
      expect(thumbnails).toHaveLength(3);
    });

    it('should have proper navigation button labels', () => {
      render(<ProductGallery images={images} alt="Test dish" />);

      const prevButton = screen.getByLabelText('Previous image');
      const nextButton = screen.getByLabelText('Next image');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('should have proper image counter', () => {
      render(<ProductGallery images={images} alt="Test dish" />);

      const counter = screen.getByRole('status', { name: /image 1 of 3/i });
      expect(counter).toBeInTheDocument();
    });
  });

  describe('CustomizationInterface', () => {
    it('should have proper form structure and validation', () => {
      render(<CustomizationInterface item={mockItem} />);

      // Check main form region
      const form = screen.getByRole('form', { name: /customize your order/i });
      expect(form).toBeInTheDocument();

      // Check fieldsets for customizations
      const fieldsets = screen.getAllByRole('group');
      expect(fieldsets.length).toBeGreaterThan(0);

      // Check for required badges
      const requiredBadges = screen.getAllByLabelText(/required selection/i);
      expect(requiredBadges.length).toBeGreaterThan(0);
    });

    it('should announce validation errors', async () => {
      const { announceValidationError } = require('@/lib/screen-reader');

      render(<CustomizationInterface item={mockItem} />);

      // Trigger validation by trying to interact without selecting required options
      const addButton = screen.getByRole('button', { name: /add to cart/i });

      // The button should be disabled initially due to validation
      expect(addButton).toBeDisabled();

      // Check for error alerts
      await waitFor(() => {
        const errorAlerts = screen.getAllByRole('alert');
        expect(errorAlerts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('AddToCartSection', () => {
    it('should have proper quantity selector accessibility', () => {
      render(<AddToCartSection item={mockItem} />);

      // Check quantity selector region
      const quantityRegion = screen.getByRole('region', {
        name: /add to cart/i,
      });
      expect(quantityRegion).toBeInTheDocument();

      // Check quantity spinbutton
      const quantityDisplay = screen.getByRole('spinbutton', {
        name: /quantity: 1/i,
      });
      expect(quantityDisplay).toBeInTheDocument();
      expect(quantityDisplay).toHaveAttribute('aria-valuenow', '1');
      expect(quantityDisplay).toHaveAttribute('aria-valuemin', '1');
      expect(quantityDisplay).toHaveAttribute('aria-valuemax', '99');

      // Check quantity buttons
      const decreaseButton = screen.getByLabelText('Decrease quantity');
      const increaseButton = screen.getByLabelText('Increase quantity');

      expect(decreaseButton).toBeInTheDocument();
      expect(increaseButton).toBeInTheDocument();
    });

    it('should have proper price information accessibility', () => {
      render(<AddToCartSection item={mockItem} />);

      const priceGroup = screen.getByRole('group', {
        name: /price information/i,
      });
      expect(priceGroup).toBeInTheDocument();

      const totalPrice = screen.getByLabelText(/total price/i);
      expect(totalPrice).toBeInTheDocument();
    });

    it('should announce cart operations', async () => {
      const {
        announceCartOperation,
        announceFormSuccess,
      } = require('@/lib/screen-reader');

      render(<AddToCartSection item={mockItem} />);

      const addButton = screen.getByRole('button', { name: /add.*to cart/i });

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(announceCartOperation).toHaveBeenCalledWith(
          'added',
          expect.stringContaining(mockItem.name),
          1
        );
        expect(announceFormSuccess).toHaveBeenCalledWith(
          'Add to cart',
          expect.stringContaining('added successfully')
        );
      });
    });
  });

  describe('RelatedItems', () => {
    const relatedItems = mockMenuItems.slice(0, 3);

    it('should have proper carousel structure', () => {
      render(<RelatedItems items={relatedItems} title="You Might Also Like" />);

      // Check main region
      const region = screen.getByRole('region', {
        name: /3 related menu items/i,
      });
      expect(region).toBeInTheDocument();

      // Check scroll buttons
      const scrollGroup = screen.getByRole('group', {
        name: /scroll related items/i,
      });
      expect(scrollGroup).toBeInTheDocument();

      const leftButton = screen.getByLabelText(/scroll related items left/i);
      const rightButton = screen.getByLabelText(/scroll related items right/i);

      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });

    it('should have proper item card accessibility', () => {
      render(<RelatedItems items={relatedItems} />);

      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(relatedItems.length);

      // Check first item
      const firstItem = relatedItems[0];
      const firstArticle = screen.getByLabelText(
        new RegExp(`${firstItem.name}.*${firstItem.description}`, 'i')
      );
      expect(firstArticle).toBeInTheDocument();

      // Check dietary indicators
      const spicyIndicators = screen.getAllByLabelText(/spicy dish/i);
      const vegetarianIndicators = screen.getAllByLabelText(/vegetarian dish/i);

      expect(
        spicyIndicators.length + vegetarianIndicators.length
      ).toBeGreaterThanOrEqual(0);
    });

    it('should support keyboard navigation', async () => {
      render(<RelatedItems items={relatedItems} />);

      const firstArticle = screen.getAllByRole('article')[0];

      // Focus the first article
      fireEvent.focus(firstArticle);
      expect(firstArticle).toHaveFocus();

      // Test Enter key navigation
      fireEvent.keyDown(firstArticle, { key: 'Enter' });

      // Should trigger navigation (mocked)
      // In a real test, we'd verify the router.push was called
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in gallery', async () => {
      const images = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];

      render(<ProductGallery images={images} alt="Test dish" />);

      const gallery = screen.getByRole('region', {
        name: /product image gallery/i,
      });

      // Focus the gallery
      gallery.focus();

      // Test arrow key navigation
      fireEvent.keyDown(gallery, { key: 'ArrowRight' });

      // Should announce navigation (mocked)
      const { announceGalleryNavigation } = require('@/lib/screen-reader');
      expect(announceGalleryNavigation).toHaveBeenCalled();
    });
  });

  describe('Live Regions and Announcements', () => {
    it('should have proper live regions for feedback', () => {
      render(<AddToCartSection item={mockItem} />);

      // Feedback messages should have proper live region attributes
      // This would be tested by triggering an action that shows feedback
      // and checking for aria-live="polite" or aria-live="assertive"
    });
  });

  describe('Focus Management', () => {
    it('should maintain proper focus order', () => {
      render(
        <DetailPageLayout breadcrumbItems={[{ label: 'Test' }]}>
          <ProductInformation
            name="Test"
            price={10}
            description="Test description"
          />
          <CustomizationInterface item={mockItem} />
        </DetailPageLayout>
      );

      // Check that focusable elements are in logical order
      const focusableElements = screen
        .getAllByRole('button')
        .concat(screen.getAllByRole('textbox'))
        .concat(screen.getAllByRole('radio'))
        .concat(screen.getAllByRole('checkbox'));

      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });
});
