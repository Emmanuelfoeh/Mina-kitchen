import { Suspense } from 'react';
import { PackageBrowser } from '@/components/packages/package-browser';
import { PackageSkeleton } from '@/components/packages/package-skeleton';

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Meal Packages
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Discover our carefully curated meal packages featuring authentic
            West African cuisine. Perfect for individuals, families, or anyone
            looking to experience the rich flavors of Africa.
          </p>
        </div>

        {/* Package Browser */}
        <Suspense fallback={<PackageSkeleton />}>
          <PackageBrowser />
        </Suspense>
      </div>
    </div>
  );
}
