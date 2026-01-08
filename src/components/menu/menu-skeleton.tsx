import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function MenuSkeleton() {
  return (
    <div className="space-y-8">
      {/* Category sections */}
      {[1, 2, 3].map(section => (
        <div key={section} className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(item => (
              <Card key={item} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-4 pt-3">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
