/**
 * Screen Reader Utilities Tests
 */

import {
  announceToScreenReader,
  announceNavigation,
  announceCartOperation,
  announceCustomizationChange,
  announcePriceUpdate,
  announceValidationError,
  announceFormSuccess,
  announceGalleryNavigation,
  getKeyboardInstructions,
  initializeScreenReaderSupport,
} from '../screen-reader';

// Mock DOM methods
const mockElement = {
  setAttribute: jest.fn(),
  appendChild: jest.fn(),
  textContent: '',
  className: '',
  id: '',
};

const mockDocument = {
  getElementById: jest.fn(),
  createElement: jest.fn(() => mockElement),
  body: {
    appendChild: jest.fn(),
    insertBefore: jest.fn(),
    firstChild: null,
  },
  querySelector: jest.fn(),
};

// Mock global document
(global as any).document = mockDocument;

// Mock setTimeout
jest.useFakeTimers();

describe('Screen Reader Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockDocument.getElementById.mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('announceToScreenReader', () => {
    it('should create live region if it does not exist', () => {
      mockDocument.getElementById.mockReturnValue(null);

      announceToScreenReader('Test message');

      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'aria-live',
        'polite'
      );
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'aria-atomic',
        'true'
      );
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    it('should use existing live region if it exists', () => {
      const existingElement = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(existingElement);

      announceToScreenReader('Test message');

      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(existingElement.setAttribute).toHaveBeenCalledWith(
        'aria-live',
        'polite'
      );
    });

    it('should set message with delay', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceToScreenReader('Test message', 'assertive', 100);

      expect(liveRegion.textContent).toBe('');

      jest.advanceTimersByTime(100);

      expect(liveRegion.textContent).toBe('Test message');
      expect(liveRegion.setAttribute).toHaveBeenCalledWith(
        'aria-live',
        'assertive'
      );
    });

    it('should clear message after announcement', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceToScreenReader('Test message');

      jest.advanceTimersByTime(0); // Trigger immediate announcement
      expect(liveRegion.textContent).toBe('Test message');

      jest.advanceTimersByTime(1000); // Trigger clear
      expect(liveRegion.textContent).toBe('');
    });
  });

  describe('announceNavigation', () => {
    it('should announce navigation with page name only', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceNavigation('Product Page');

      jest.advanceTimersByTime(500);

      expect(liveRegion.textContent).toBe('Navigated to Product Page.');
    });

    it('should announce navigation with breadcrumb path', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceNavigation('Product Page', ['Home', 'Menu', 'Items']);

      jest.advanceTimersByTime(500);

      expect(liveRegion.textContent).toBe(
        'Navigated to Product Page. Navigation path: Home > Menu > Items'
      );
    });
  });

  describe('announceCartOperation', () => {
    it('should announce item added to cart', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceCartOperation('added', 'Jollof Rice', 2, 5);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Jollof Rice (2 items) added to cart. Cart now has 5 items.'
      );
    });

    it('should announce item removed from cart', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceCartOperation('removed', 'Jollof Rice', undefined, 3);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Jollof Rice removed from cart. Cart now has 3 items.'
      );
    });

    it('should announce quantity update', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceCartOperation('updated', 'Jollof Rice', 3);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe('Jollof Rice quantity updated to 3.');
    });
  });

  describe('announceCustomizationChange', () => {
    it('should announce customization with price increase', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceCustomizationChange('Spice Level', 'Extra Hot', 2.5);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Spice Level changed to Extra Hot. This adds $2.50 to the total price.'
      );
    });

    it('should announce customization with price decrease', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceCustomizationChange('Size', 'Small', -1.0);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Size changed to Small. This saves $1.00 to the total price.'
      );
    });

    it('should announce customization without price change', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceCustomizationChange('Preparation', 'Well Done');

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe('Preparation changed to Well Done.');
    });
  });

  describe('announcePriceUpdate', () => {
    it('should announce price update with context', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announcePriceUpdate(15.99, 'with customizations');

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Price updated with customizations: $15.99'
      );
    });

    it('should announce price update without context', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announcePriceUpdate(12.5);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe('Price updated: $12.50');
    });
  });

  describe('announceValidationError', () => {
    it('should announce validation error with assertive priority', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceValidationError('Spice Level', 'This field is required');

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Error in Spice Level: This field is required'
      );
      expect(liveRegion.setAttribute).toHaveBeenCalledWith(
        'aria-live',
        'assertive'
      );
    });
  });

  describe('announceFormSuccess', () => {
    it('should announce form success', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceFormSuccess('Add to cart', 'Item added successfully');

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe(
        'Add to cart successful. Item added successfully'
      );
    });
  });

  describe('announceGalleryNavigation', () => {
    it('should announce gallery navigation with image name', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceGalleryNavigation(2, 5, 'Jollof Rice');

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe('Image 3 of 5 Jollof Rice');
    });

    it('should announce gallery navigation without image name', () => {
      const liveRegion = { ...mockElement };
      mockDocument.getElementById.mockReturnValue(liveRegion);

      announceGalleryNavigation(0, 3);

      jest.advanceTimersByTime(0);

      expect(liveRegion.textContent).toBe('Image 1 of 3');
    });
  });

  describe('getKeyboardInstructions', () => {
    it('should return instructions for gallery', () => {
      const instructions = getKeyboardInstructions('gallery');
      expect(instructions).toBe(
        'Use arrow keys to navigate between images, or click on thumbnails below.'
      );
    });

    it('should return instructions for carousel', () => {
      const instructions = getKeyboardInstructions('carousel');
      expect(instructions).toBe(
        'Use arrow keys or scroll horizontally to view more items.'
      );
    });

    it('should return default instructions for unknown component', () => {
      const instructions = getKeyboardInstructions('unknown');
      expect(instructions).toBe('Use tab to navigate, enter to activate.');
    });
  });

  describe('initializeScreenReaderSupport', () => {
    it('should create live region if it does not exist', () => {
      mockDocument.getElementById.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);

      initializeScreenReaderSupport();

      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'aria-live',
        'polite'
      );
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'aria-atomic',
        'true'
      );
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    it('should create skip link if it does not exist', () => {
      mockDocument.getElementById.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);

      initializeScreenReaderSupport();

      // Should create two elements: live region and skip link
      expect(mockDocument.createElement).toHaveBeenCalledTimes(2);
      expect(mockDocument.body.insertBefore).toHaveBeenCalled();
    });

    it('should not create elements if they already exist', () => {
      mockDocument.getElementById.mockReturnValue(mockElement);
      mockDocument.querySelector.mockReturnValue(mockElement);

      initializeScreenReaderSupport();

      expect(mockDocument.createElement).not.toHaveBeenCalled();
    });
  });
});
