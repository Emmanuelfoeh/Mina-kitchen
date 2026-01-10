/**
 * Screen Reader Utilities
 * Provides functions for making announcements to screen readers
 * and managing accessibility features
 */

export interface ScreenReaderAnnouncement {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

/**
 * Announces a message to screen readers using a live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  delay: number = 0
): void {
  // Create or get existing live region
  let liveRegion = document.getElementById('screen-reader-announcements');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announcements';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  } else {
    // Update the aria-live attribute if priority changed
    liveRegion.setAttribute('aria-live', priority);
  }

  // Announce the message after optional delay
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;

      // Clear the message after a short delay to allow for repeated announcements
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = '';
        }
      }, 1000);
    }
  }, delay);
}

/**
 * Announces navigation changes to screen readers
 */
export function announceNavigation(
  pageName: string,
  breadcrumbPath?: string[]
): void {
  const pathText = breadcrumbPath
    ? ` Navigation path: ${breadcrumbPath.join(' > ')}`
    : '';
  announceToScreenReader(`Navigated to ${pageName}.${pathText}`, 'polite', 500);
}

/**
 * Announces cart operations to screen readers
 */
export function announceCartOperation(
  operation: 'added' | 'removed' | 'updated',
  itemName: string,
  quantity?: number,
  totalItems?: number
): void {
  let message = '';

  switch (operation) {
    case 'added':
      message = `${itemName} ${quantity && quantity > 1 ? `(${quantity} items)` : ''} added to cart.`;
      if (totalItems) {
        message += ` Cart now has ${totalItems} ${totalItems === 1 ? 'item' : 'items'}.`;
      }
      break;
    case 'removed':
      message = `${itemName} removed from cart.`;
      if (totalItems !== undefined) {
        message += ` Cart now has ${totalItems} ${totalItems === 1 ? 'item' : 'items'}.`;
      }
      break;
    case 'updated':
      message = `${itemName} quantity updated${quantity ? ` to ${quantity}` : ''}.`;
      break;
  }

  announceToScreenReader(message, 'assertive');
}

/**
 * Announces customization changes to screen readers
 */
export function announceCustomizationChange(
  customizationName: string,
  selectedOption: string,
  priceChange?: number
): void {
  let message = `${customizationName} changed to ${selectedOption}.`;

  if (priceChange && priceChange !== 0) {
    const changeText =
      priceChange > 0
        ? `adds $${priceChange.toFixed(2)}`
        : `saves $${Math.abs(priceChange).toFixed(2)}`;
    message += ` This ${changeText} to the total price.`;
  }

  announceToScreenReader(message, 'polite');
}

/**
 * Announces price updates to screen readers
 */
export function announcePriceUpdate(newPrice: number, context?: string): void {
  const contextText = context ? ` ${context}` : '';
  announceToScreenReader(
    `Price updated${contextText}: $${newPrice.toFixed(2)}`,
    'polite'
  );
}

/**
 * Announces loading states to screen readers
 */
export function announceLoadingState(
  isLoading: boolean,
  context?: string
): void {
  const contextText = context ? ` ${context}` : '';
  const message = isLoading
    ? `Loading${contextText}...`
    : `Loading complete${contextText}.`;

  announceToScreenReader(message, 'polite');
}

/**
 * Announces form validation errors to screen readers
 */
export function announceValidationError(
  fieldName: string,
  errorMessage: string
): void {
  announceToScreenReader(`Error in ${fieldName}: ${errorMessage}`, 'assertive');
}

/**
 * Announces successful form submissions to screen readers
 */
export function announceFormSuccess(action: string, details?: string): void {
  const message = `${action} successful.${details ? ` ${details}` : ''}`;
  announceToScreenReader(message, 'assertive');
}

/**
 * Announces image gallery navigation to screen readers
 */
export function announceGalleryNavigation(
  currentIndex: number,
  totalImages: number,
  imageName?: string
): void {
  const nameText = imageName ? ` ${imageName}` : '';
  announceToScreenReader(
    `Image ${currentIndex + 1} of ${totalImages}${nameText}`,
    'polite'
  );
}

/**
 * Announces search results to screen readers
 */
export function announceSearchResults(
  resultCount: number,
  searchTerm?: string
): void {
  const termText = searchTerm ? ` for "${searchTerm}"` : '';
  const resultText = resultCount === 1 ? 'result' : 'results';

  announceToScreenReader(
    `${resultCount} ${resultText} found${termText}`,
    'polite'
  );
}

/**
 * Creates accessible descriptions for complex UI elements
 */
export function createAccessibleDescription(
  element: HTMLElement,
  description: string,
  id?: string
): string {
  const descriptionId = id || `desc-${Math.random().toString(36).substr(2, 9)}`;

  // Create or update description element
  let descElement = document.getElementById(descriptionId);
  if (!descElement) {
    descElement = document.createElement('div');
    descElement.id = descriptionId;
    descElement.className = 'sr-only';
    document.body.appendChild(descElement);
  }

  descElement.textContent = description;

  // Link the element to its description
  element.setAttribute('aria-describedby', descriptionId);

  return descriptionId;
}

/**
 * Manages focus for modal dialogs and overlays
 */
export function manageFocusForModal(
  modalElement: HTMLElement,
  isOpen: boolean,
  previouslyFocusedElement?: HTMLElement
): void {
  if (isOpen) {
    // Store the previously focused element
    if (!previouslyFocusedElement) {
      previouslyFocusedElement = document.activeElement as HTMLElement;
    }

    // Focus the modal
    modalElement.focus();

    // Trap focus within the modal
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  } else {
    // Return focus to the previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }
}

/**
 * Provides keyboard navigation instructions for complex components
 */
export function getKeyboardInstructions(componentType: string): string {
  const instructions: Record<string, string> = {
    gallery:
      'Use arrow keys to navigate between images, or click on thumbnails below.',
    carousel: 'Use arrow keys or scroll horizontally to view more items.',
    customization:
      'Use tab to navigate between options, space or enter to select.',
    quantity: 'Use plus and minus buttons or arrow keys to adjust quantity.',
    menu: 'Use arrow keys to navigate menu items, enter to select.',
  };

  return (
    instructions[componentType] || 'Use tab to navigate, enter to activate.'
  );
}

/**
 * Initializes screen reader support for the application
 */
export function initializeScreenReaderSupport(): void {
  // Create the live region for announcements if it doesn't exist
  if (!document.getElementById('screen-reader-announcements')) {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announcements';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  // Add skip links if they don't exist
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className =
      'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg rounded-md border';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}
