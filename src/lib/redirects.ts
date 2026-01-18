/**
 * URL redirect utilities for handling invalid URLs and implementing proper redirects
 */

import { redirect } from 'next/navigation';

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
export async function getRedirectUrl(pathname: string): Promise<string | null> {
  // Check for exact pattern matches
  for (const [pattern, replacement] of Object.entries(REDIRECT_PATTERNS)) {
    if (pathname.startsWith(pattern)) {
      return pathname.replace(pattern, replacement);
    }
  }

  // Check for menu item redirects
  const menuItemRedirect = await getMenuItemRedirect(pathname);
  if (menuItemRedirect) {
    return menuItemRedirect;
  }

  // Check for package redirects
  const packageRedirect = await getPackageRedirect(pathname);
  if (packageRedirect) {
    return packageRedirect;
  }

  return null;
}

/**
 * Handle menu item URL redirects
 */
async function getMenuItemRedirect(pathname: string): Promise<string | null> {
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

      try {
        // Check if this slug exists in menu items via API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu/items`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const item = data.data.find((item: any) => item.slug === slug);
            if (item) {
              return `/menu/items/${item.slug}`;
            }
          }
        }
      } catch (error) {
        console.error('Error checking menu items for redirect:', error);
      }
    }
  }

  return null;
}

/**
 * Handle package URL redirects
 */
async function getPackageRedirect(pathname: string): Promise<string | null> {
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

      try {
        // Check if this slug exists in packages via API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/packages`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const pkg = data.data.find((pkg: any) => pkg.slug === slug);
            if (pkg) {
              return `/packages/${pkg.slug}`;
            }
          }
        }
      } catch (error) {
        console.error('Error checking packages for redirect:', error);
      }
    }
  }

  return null;
}

/**
 * Middleware helper to handle redirects
 */
export async function handleRedirect(pathname: string): Promise<void> {
  const redirectUrl = await getRedirectUrl(pathname);
  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

/**
 * Get suggested URLs for 404 pages based on the requested path
 */
export async function getSuggestedUrls(
  pathname: string
): Promise<Array<{ label: string; href: string }>> {
  const suggestions: Array<{ label: string; href: string }> = [];

  // Always suggest main pages
  suggestions.push(
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Packages', href: '/packages' }
  );

  try {
    // If it looks like a menu item URL, suggest popular items
    if (pathname.includes('/menu') || pathname.includes('/item')) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu/items`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const popularItems = data.data.slice(0, 3);
          popularItems.forEach((item: any) => {
            suggestions.push({
              label: item.name,
              href: `/menu/items/${item.slug}`,
            });
          });
        }
      }
    }

    // If it looks like a package URL, suggest popular packages
    if (pathname.includes('/package') || pathname.includes('/bundle')) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/packages`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const popularPackages = data.data.slice(0, 3);
          popularPackages.forEach((pkg: any) => {
            suggestions.push({
              label: pkg.name,
              href: `/packages/${pkg.slug}`,
            });
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
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
