'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Clock, Layers } from 'lucide-react';
import { useAdminMenuStats } from '@/hooks/queries/use-admin-queries';

export function MenuStats() {
  const { data: stats, isLoading: loading, error } = useAdminMenuStats();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm text-gray-500">
              {error instanceof Error
                ? error.message
                : 'Failed to load statistics'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview } = stats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalItems}</div>
          <p className="text-muted-foreground text-xs">
            {overview.recentItems} added this week
          </p>
        </CardContent>
      </Card>

      {/* Issues (Sold Out + Low Stock) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Items with Issues
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {overview.soldOutItems + overview.lowStockItems}
          </div>
          <div className="text-muted-foreground flex gap-2 text-xs">
            <Badge variant="destructive" className="text-xs">
              {overview.soldOutItems} sold out
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {overview.lowStockItems} low stock
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Layers className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalCategories}</div>
          <p className="text-muted-foreground text-xs">
            {overview.activeCategories} active categories
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.recentItems}</div>
          <p className="text-muted-foreground text-xs">Items added this week</p>
        </CardContent>
      </Card>
    </div>
  );
}
