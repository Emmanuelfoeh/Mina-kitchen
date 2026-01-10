/**
 * Navigation utilities for managing navigation state and breadcrumb generation
 */

import { BreadcrumbItem } from '@/components/ui/breadcrumb';
import type { MenuItem, Package, MenuCategory } from '@/types';

export interface NavigationState {
  previousUrl?: string;
  referrer?: string;
  timestamp: number;
}

/**
 * Navigation state management
 */
export class NavigationManager {
  private static instance: NavigationManager;
  private navigationHistory: NavigationState[] = [];
  private maxHistorySize = 10;

  private constructor() {
    // Initialize with current state if in browser
    if (typeof window !== 'undefined') {
      this.recordNavigation(window.location.href);
    }
  }

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  /**
   * Record a navigation event
   */
  recordNavigation(url: string, referrer?: string): void {
    const state: NavigationState = {
      previousUrl: this.getCurrentUrl(),
      referrer,
      timestamp: Date.now(),
    };

    this.navigationHistory.push(state);

    // Keep history size manageable
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift();
    }
  }

  /**
   * Get the previous URL from navigation history
   */
  getPreviousUrl(): string | undefined {
    if (this.navigationHistory.length < 2) {
      return undefined;
    }
    return this.navigationHistory[this.navigationHistory.length - 2]
      ?.previousUrl;
  }

  /**
   * Get current URL
   */
  private getCurrentUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }

  /**
   * Navigate back to previous location with fallback
   */
  navigateBack(fallbackUrl: string = '/'): void {
    if (typeof window === 'undefined') return;

    const previousUrl = this.getPreviousUrl();

    if (previousUrl && this.isValidBackNavigation(previousUrl)) {
      window.history.back();
    } else {
      window.location.href = fallbackUrl;
    }
  }

  /**
   * Check if the previous URL is a valid back navigation target
   */
  private isValidBackNavigation(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const currentOrigin = window.location.origin;

      // Only allow navigation within the same origin
      if (urlObj.origin !== currentOrigin) {
        return false;
      }

      // Don't navigate back to auth pages or checkout
      const restrictedPaths = ['/auth/', '/checkout/', '/api/'];
      return !restrictedPaths.some(path => urlObj.pathname.includes(path));
    } catch {
      return false;
    }
  }

  /**
   * Get navigation context for analytics
   */
  getNavigationContext(): {
    previousUrl?: string;
    referrer?: string;
    sessionLength: number;
  } {
    const latest = this.navigationHistory[this.navigationHistory.length - 1];
    const earliest = this.navigationHistory[0];

    return {
      previousUrl: latest?.previousUrl,
      referrer: latest?.referrer,
      sessionLength:
        latest && earliest ? latest.timestamp - earliest.timestamp : 0,
    };
  }
}

/**
 * Breadcrumb generation utilities
 */
export class BreadcrumbGenerator {
  /**
   * Generate breadcrumbs for menu item pages
   */
  static forMenuItem(item: MenuItem): BreadcrumbItem[] {
    return [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '/menu' },
      {
        label: item.category.name,
        href: `/menu?category=${encodeURIComponent(item.category.id)}`,
      },
      { label: item.name }, // Current page - no href
    ];
  }

  /**
   * Generate breadcrumbs for package pages
   */
  static forPackage(pkg: Package): BreadcrumbItem[] {
    return [
      { label: 'Home', href: '/' },
      { label: 'Packages', href: '/packages' },
      { label: pkg.name }, // Current page - no href
    ];
  }

  /**
   * Generate breadcrumbs for menu category pages
   */
  static forMenuCategory(category: MenuCategory): BreadcrumbItem[] {
    return [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '/menu' },
      { label: category.name }, // Current page - no href
    ];
  }

  /**
   * Generate breadcrumbs for search results
   */
  static forSearch(query: string, category?: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Menu', href: '/menu' },
    ];

    if (category) {
      breadcrumbs.push({
        label: category,
        href: `/menu?category=${encodeURIComponent(category)}`,
      });
    }

    breadcrumbs.push({
      label: `Search: "${query}"`,
    });

    return breadcrumbs;
  }

  /**
   * Generate breadcrumbs for user profile sections
   */
  static forProfile(section?: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Profile', href: '/profile' },
    ];

    if (section) {
      breadcrumbs.push({ label: section });
    }

    return breadcrumbs;
  }

  /**
   * Generate dynamic breadcrumbs based on URL path
   */
  static fromPath(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Decode URL segments and capitalize
      const label = decodeURIComponent(segment)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  }
}

/**
 * Back button functionality hook for React components
 */
export function useBackNavigation() {
  const navigationManager = NavigationManager.getInstance();

  const goBack = (fallbackUrl?: string) => {
    navigationManager.navigateBack(fallbackUrl);
  };

  const canGoBack = (): boolean => {
    return navigationManager.getPreviousUrl() !== undefined;
  };

  const getPreviousUrl = (): string | undefined => {
    return navigationManager.getPreviousUrl();
  };

  return {
    goBack,
    canGoBack,
    getPreviousUrl,
    navigationContext: navigationManager.getNavigationContext(),
  };
}

/**
 * Initialize navigation tracking (call this in layout or app component)
 */
export function initializeNavigation(): void {
  if (typeof window === 'undefined') return;

  const navigationManager = NavigationManager.getInstance();

  // Track page navigation
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    navigationManager.recordNavigation(window.location.href);
    return originalPushState.apply(this, args);
  };

  window.history.replaceState = function (...args) {
    navigationManager.recordNavigation(window.location.href);
    return originalReplaceState.apply(this, args);
  };

  // Track popstate (back/forward button)
  window.addEventListener('popstate', () => {
    navigationManager.recordNavigation(window.location.href);
  });

  // Track initial page load
  navigationManager.recordNavigation(window.location.href, document.referrer);
}
