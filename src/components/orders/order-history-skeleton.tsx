export function OrderHistorySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="space-y-1">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
