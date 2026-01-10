'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockPackages, mockMenuItems } from '@/lib/mock-data';
import { PackageCard } from './package-card';
import { generateSlug } from '@/lib/utils';
import type { Package } from '@/types';

export function PackageBrowser() {
  const router = useRouter();

  const handleSelectPackage = (pkg: Package) => {
    const slug = pkg.slug || generateSlug(pkg.name);
    router.push(`/packages/${slug}`);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {mockPackages.map(pkg => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          menuItems={mockMenuItems}
          onSelect={() => handleSelectPackage(pkg)}
        />
      ))}
    </div>
  );
}
