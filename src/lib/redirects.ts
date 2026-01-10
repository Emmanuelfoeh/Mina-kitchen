/**
 * URL redirect utilities for handling invalid URLs and implementing proper redirects
 */

import { redirect } from 'next/navigation';
import { mockMenuItems, mockPackages } from '@/lib/mock-data';
import { generateSlug } from '@/lib/utils';

/**
 * Redirect patterns for common URL mistakes
 */
export const REDIRECT_PATTERNS = {
  // Legacy URL patterns that might exist
  '/item/': '/menu/items/',
  '/product/': '/menu/items/',
  '/meal/': '/menu/items/',
  '/package/': '/packages/',
  '/bundle/': '/packages/',
  '/deal/': '/packages/',

  // Common typos
  '/manu/': '/menu/',
  '/packges/': '/packages/',
  '/pakages/': '/packages/',
} as const;

/**
 * Check if a URL should be redirected and return the correct URL
 */
export function getRedirectUrl(pathname: string): string | null {
  // Check for exact pattern matches
  for (const [pattern, replacement] of Object.entries(REDIRECT_PATTERNS)) {
    if (pathname.startsWith(pattern)) {
      return pathname.replace(pattern, replacement);
    }
  }

  // Check for menu item redirects
  const menuItemRedirect = getMenuItemRedirect(pathname);
  if (menuItemRedirect) {
    return menuItemRedirect;
  }

  // Check for package redirects
  const packageRedirect = getPackageRedirect(pathname);
  if (packageRedirect) {
    return packageRedirect;
  }

  return null;
}

/**
 * Handle menu item URL redirects
 */
function getMenuItemRedirect(pathname: string): string | null {
  // Handle legacy menu item URLs
  const legacyPatterns = [
    /^\/item\/(.+)$/,
    /^\/product\/(.+)$/,
    /^\/meal\/(.+)$/,
  ];

  for (const pattern of legacyPatterns) {
    const match = pathname.match(pattern);
    if (match) {
      const slug = match[1];

      // Check if this slug exists in menu items
      const item = mockMenuItems.find(
        item => (item.slug || generateSlug(item.name)) === slug
      );

      if (item) {
        return `/menu/items/${item.slug || generateSlug(item.name)}`;
      }
    }
  }

  return null;
}

/**
 * Handle package URL redirects
 */
function getPackageRedirect(pathname: string): string | null {
  // Handle legacy package URLs
  const legacyPatterns = [
    /^\/package\/(.+)$/,
    /^\/bundle\/(.+)$/,
    /^\/deal\/(.+)$/,
  ];

  for (const pattern of legacyPatterns) {
    const match = pathname.match(pattern);
    if (match) {
      const slug = match[1];

      // Check if this slug exists in packages
      const pkg = mockPackages.find(
        pkg => (pkg.slug || generateSlug(pkg.name)) === slug
      );

      if (pkg) {
        return `/packages/${pkg.slug || generateSlug(pkg.name)}`;
      }
    }
  }

  return null;
}

/**
 * Find item by fuzzy slug matching (handles typos and variations)
 */
function findItemByFuzzySlug<T extends { name: string; slug?: string }>(
  providedSlug: string,
  items: T[]
): T | null {
  const normalizedSlug = providedSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // First try exact match
  let item = items.find(
    item => (item.slug || generateSlug(item.name)) === providedSlug
  );

  if (item) return item;

  // Try normalized match
  item = items.find(item => {
    const itemSlug = (item.slug || generateSlug(item.name))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    return itemSlug === normalizedSlug;
  });

  if (item) return item;

  // Try partial match (for truncated URLs)
  item = items.find(item => {
    const itemSlug = item.slug || generateSlug(item.name);
    return (
      itemSlug.startsWith(providedSlug) || providedSlug.startsWith(itemSlug)
    );
  });

  if (item) return item;

  // Try name-based matching
  item = items.find(item => {
    const nameSlug = generateSlug(item.name);
    return (
      nameSlug === providedSlug ||
      nameSlug.includes(providedSlug) ||
      providedSlug.includes(nameSlug)
    );
  });

  return item || null;
}

/**
 * Middleware helper to handle redirects
 */
export function handleRedirect(pathname: string): void {
  const redirectUrl = getRedirectUrl(pathname);
  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

/**
 * Get suggested URLs for 404 pages based on the requested path
 */
export function getSuggestedUrls(
  pathname: string
): Array<{ label: string; href: string }> {
  const suggestions: Array<{ label: string; href: string }> = [];

  // Always suggest main pages
  suggestions.push(
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Packages', href: '/packages' }
  );

  // If it looks like a menu item URL, suggest popular items
  if (pathname.includes('/menu') || pathname.includes('/item')) {
    const popularItems = mockMenuItems.slice(0, 3);
    popularItems.forEach(item => {
      suggestions.push({
        label: item.name,
        href: `/menu/items/${item.slug || generateSlug(item.name)}`,
      });
    });
  }

  // If it looks like a package URL, suggest popular packages
  if (pathname.includes('/package') || pathname.includes('/bundle')) {
    const popularPackages = mockPackages.slice(0, 3);
    popularPackages.forEach(pkg => {
      suggestions.push({
        label: pkg.name,
        href: `/packages/${pkg.slug || generateSlug(pkg.name)}`,
      });
    });
  }

  return suggestions;
}

/**
 * Check if a URL is a valid internal URL
 */
export function isValidInternalUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  try {
    const urlObj = new URL(url, 'https://example.com');
    const pathname = urlObj.pathname;

    // Check against known valid patterns
    const validPatterns = [
      /^\/$/, // Home
      /^\/menu$/, // Menu
      /^\/menu\/items\/[^/]+$/, // Menu items
      /^\/packages$/, // Packages
      /^\/packages\/[^/]+$/, // Package details
      /^\/auth\/(login|register)$/, // Auth pages
      /^\/profile$/, // Profile
      /^\/about$/, // About
      /^\/contact$/, // Contact
      /^\/subscriptions$/, // Subscriptions
      /^\/checkout$/, // Checkout
      /^\/order-confirmation$/, // Order confirmation
    ];

    return validPatterns.some(pattern => pattern.test(pathname));
  } catch {
    return false;
  }
}
