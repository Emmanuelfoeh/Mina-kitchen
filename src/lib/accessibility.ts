/**
 * Accessibility utilities for enhanced user experience
 */

// Screen reader announcements
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Keyboard navigation helpers
export function handleArrowNavigation(
  items: HTMLElement[],
  currentIndex: number,
  direction: 'up' | 'down' | 'left' | 'right'
): number {
  let newIndex = currentIndex;

  switch (direction) {
    case 'up':
    case 'left':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      break;
    case 'down':
    case 'right':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      break;
  }

  items[newIndex]?.focus();
  return newIndex;
}

// ARIA helpers
export function generateAriaLabel(context: string, details?: string): string {
  return details ? `${context}, ${details}` : context;
}

export function generateAriaDescription(
  baseDescription: string,
  additionalInfo?: string[]
): string {
  const parts = [baseDescription];
  if (additionalInfo?.length) {
    parts.push(...additionalInfo);
  }
  return parts.join('. ');
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use a proper color library in production
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function meetsWCAGContrast(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// Skip link functionality
export function createSkipLink(
  targetId: string,
  text: string = 'Skip to main content'
): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md';

  return skipLink;
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast detection
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Focus visible utilities
export function addFocusVisibleSupport() {
  // Add focus-visible polyfill behavior
  let hadKeyboardEvent = true;

  const keyboardThrottleTimeout = 100;
  let keyboardThrottleTimeoutID = 0;

  function onPointerDown() {
    hadKeyboardEvent = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }

    hadKeyboardEvent = true;
  }

  function onFocus(e: FocusEvent) {
    if (
      hadKeyboardEvent ||
      (e.target as HTMLElement).matches(':focus-visible')
    ) {
      (e.target as HTMLElement).classList.add('focus-visible');
    }
  }

  function onBlur(e: FocusEvent) {
    (e.target as HTMLElement).classList.remove('focus-visible');
  }

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('mousedown', onPointerDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('touchstart', onPointerDown, true);
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);
}

// Live region utilities
export function createLiveRegion(
  id: string,
  level: 'polite' | 'assertive' = 'polite'
): HTMLElement {
  const existing = document.getElementById(id);
  if (existing) return existing;

  const liveRegion = document.createElement('div');
  liveRegion.id = id;
  liveRegion.setAttribute('aria-live', level);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';

  document.body.appendChild(liveRegion);
  return liveRegion;
}

export function updateLiveRegion(id: string, message: string) {
  const liveRegion = document.getElementById(id);
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}
