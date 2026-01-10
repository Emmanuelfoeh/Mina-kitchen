import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

export function PackageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          {/* Image Skeleton */}
          <Skeleton className="h-48 w-full" />

          <CardHeader className="pb-3">
            <div className="mb-2 flex items-center justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3">
                <Skeleton className="mx-auto mb-1 h-8 w-12" />
                <Skeleton className="mx-auto h-3 w-16" />
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <Skeleton className="mx-auto mb-1 h-8 w-16" />
                <Skeleton className="mx-auto h-3 w-20" />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Savings */}
            <div className="rounded-lg bg-gray-50 p-3">
              <Skeleton className="mb-1 h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <Skeleton className="h-12 w-full rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
