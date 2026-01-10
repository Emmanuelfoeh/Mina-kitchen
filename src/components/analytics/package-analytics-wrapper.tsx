'use client';

import { useDetailPageAnalytics } from '@/hooks/use-analytics';
import type { Package } from '@/types';

interface PackageAnalyticsWrapperProps {
  package: Package;
  children: React.ReactNode;
}

/**
 * Analytics wrapper for package detail pages
 * Provides analytics context and tracking for all child components
 */
export function PackageAnalyticsWrapper({
  package: pkg,
  children,
}: PackageAnalyticsWrapperProps) {
  // Initialize analytics tracking for this package
  useDetailPageAnalytics(pkg);

  return <>{children}</>;
}
