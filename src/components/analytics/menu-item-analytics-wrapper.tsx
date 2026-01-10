'use client';

import { useDetailPageAnalytics } from '@/hooks/use-analytics';
import type { MenuItem } from '@/types';

interface MenuItemAnalyticsWrapperProps {
  item: MenuItem;
  children: React.ReactNode;
}

/**
 * Analytics wrapper for menu item detail pages
 * Provides analytics context and tracking for all child components
 */
export function MenuItemAnalyticsWrapper({
  item,
  children,
}: MenuItemAnalyticsWrapperProps) {
  // Initialize analytics tracking for this menu item
  useDetailPageAnalytics(item);

  return <>{children}</>;
}
