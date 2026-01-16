import { Suspense } from 'react';
import { Metadata } from 'next';
import { PackageBrowser } from '@/components/packages/package-browser';
import { PackageSkeleton } from '@/components/packages/package-skeleton';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Meal Packages - Weekly African Food Delivery',
  description:
    'Save time and money with our curated African meal packages. Choose from Daily, Weekly, or Monthly plans featuring authentic Jollof rice, soups, and traditional dishes delivered fresh to your door.',
  keywords: [
    'African meal packages Toronto',
    'weekly meal delivery',
    'African food subscription',
    'meal prep Toronto',
    'African catering packages',
    'Jollof rice packages',
    'family meal plans',
    'African food boxes',
    'meal delivery service',
    'authentic African meals',
    'weekly food delivery',
    'African cuisine packages',
  ],
  url: '/packages',
  type: 'website',
});

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
