'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface DetailPageSkeletonProps {
  type?: 'menu-item' | 'package';
  showRelatedItems?: boolean;
  className?: string;
}

export function DetailPageSkeleton({
  type = 'menu-item',
  showRelatedItems = true,
  className = '',
}: DetailPageSkeletonProps) {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-20" />
          {type === 'menu-item' && (
            <>
              <span className="text-gray-400">/</span>
              <Skeleton className="h-4 w-24" />
            </>
          )}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Gallery skeleton */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Skeleton className="h-full w-full" />
              {/* Loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
              </div>
            </div>
            {/* Thumbnail skeleton */}
            <div className="flex space-x-2">
              <Skeleton className="h-16 w-16 rounded-md sm:h-20 sm:w-20" />
              <Skeleton className="h-16 w-16 rounded-md sm:h-20 sm:w-20" />
              <Skeleton className="h-16 w-16 rounded-md sm:h-20 sm:w-20" />
            </div>
          </div>

          {/* Information skeleton */}
          <div className="space-y-6">
            {/* Title and price */}
            <div>
              <Skeleton className="mb-2 h-8 w-3/4" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-24" />
                {type === 'package' && (
                  <>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
              </div>
            </div>

            {/* Customization section */}
            <div className="space-y-4 border-t pt-6">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Package contents skeleton (only for packages) */}
        {type === 'package' && (
          <div className="mt-12 space-y-6">
            <Skeleton className="h-8 w-48" />

            {/* Package stats */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="text-center">
                    <Skeleton className="mx-auto mb-1 h-6 w-8" />
                    <Skeleton className="mx-auto h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* Package items grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Related items skeleton */}
        {showRelatedItems && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <Card
                  key={i}
                  className="min-w-[280px] flex-shrink-0 overflow-hidden"
                >
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Specific skeleton components for different use cases
export function MenuItemPageSkeleton() {
  return <DetailPageSkeleton type="menu-item" showRelatedItems={true} />;
}

export function PackagePageSkeleton() {
  return <DetailPageSkeleton type="package" showRelatedItems={true} />;
}

// Progressive loading skeleton for image galleries
export function ImageGallerySkeleton({
  imageCount = 3,
  className = '',
}: {
  imageCount?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main image skeleton */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Skeleton className="h-full w-full" />
        {/* Loading spinner */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
        </div>
      </div>

      {/* Thumbnail skeletons */}
      {imageCount > 1 && (
        <div className="flex space-x-2">
          {Array.from({ length: Math.min(imageCount, 5) }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 w-16 flex-shrink-0 rounded-md sm:h-20 sm:w-20"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Customization interface skeleton
export function CustomizationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />

      {/* Option groups */}
      {[1, 2, 3].map(group => (
        <div key={group} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map(option => (
              <div key={option} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add to cart section */}
      <div className="space-y-3 border-t pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Related items skeleton
export function RelatedItemsSkeleton({
  itemCount = 4,
  title = 'You Might Also Like',
}: {
  itemCount?: number;
  title?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Card key={i} className="min-w-[280px] flex-shrink-0 overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
