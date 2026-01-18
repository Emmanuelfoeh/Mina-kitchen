'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCard } from './package-card';
import { PackageSkeleton } from './package-skeleton';
import { generateSlug } from '@/lib/utils';
import type { Package, MenuItem } from '@/types';

export function PackageBrowser() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch packages and menu items in parallel
      const [packagesResponse, menuItemsResponse] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/menu/items'),
      ]);

      if (!packagesResponse.ok || !menuItemsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const packagesData = await packagesResponse.json();
      const menuItemsData = await menuItemsResponse.json();

      if (packagesData.success) {
        // Add slug to packages that don't have one
        const packagesWithSlugs = (packagesData.data || []).map(
          (pkg: Package) => ({
            ...pkg,
            slug: pkg.slug || generateSlug(pkg.name),
          })
        );
        setPackages(packagesWithSlugs);
      }

      if (menuItemsData.success) {
        setMenuItems(menuItemsData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setError('Failed to load packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={fetchData}
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

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {packages.map(pkg => (
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
