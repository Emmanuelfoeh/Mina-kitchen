'use client';

import { useRouter } from 'next/navigation';
import { PackageCard } from './package-card';
import { PackageSkeleton } from './package-skeleton';
import { generateSlug } from '@/lib/utils';
import { usePackages } from '@/hooks/queries/use-package-queries';
import { useMenuItems } from '@/hooks/queries/use-menu-queries';
import type { Package } from '@/types';

export function PackageBrowser() {
  const router = useRouter();

  // Fetch packages and menu items in parallel using TanStack Query
  const {
    data: packages = [],
    isLoading: packagesLoading,
    error: packagesError,
    refetch: refetchPackages,
  } = usePackages();

  const {
    data: menuItems = [],
    isLoading: menuItemsLoading,
    error: menuItemsError,
  } = useMenuItems();

  const isLoading = packagesLoading || menuItemsLoading;
  const error = packagesError || menuItemsError;

  const handleSelectPackage = (pkg: Package) => {
    const slug = pkg.slug || generateSlug(pkg.name);
    router.push(`/packages/${slug}`);
  };

  if (isLoading) {
    return <PackageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-red-600">
          {error instanceof Error
            ? error.message
            : 'Failed to load packages. Please try again.'}
        </p>
        <button
          onClick={() => refetchPackages()}
          className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-gray-500">
          No packages available at the moment.
        </p>
      </div>
    );
  }

  // Add slugs to packages that don't have one
  const packagesWithSlugs = packages.map(pkg => ({
    ...pkg,
    slug: pkg.slug || generateSlug(pkg.name),
  }));

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {packagesWithSlugs.map(pkg => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          menuItems={menuItems}
          onSelect={() => handleSelectPackage(pkg)}
        />
      ))}
    </div>
  );
}
