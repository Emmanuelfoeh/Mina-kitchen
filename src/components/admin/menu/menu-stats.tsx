'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';

// Mock data - in real app, this would come from API
const menuStats = {
  totalItems: 21,
  activeItems: 19,
  inactiveItems: 1,
  soldOutItems: 1,
  lowStockItems: 2,
  totalCategories: 4,
  recentlyAdded: 3,
  popularItems: 8,
};

export function MenuStats() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{menuStats.totalItems}</div>
          <p className="text-muted-foreground text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />+{menuStats.recentlyAdded} this
              week
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Items</CardTitle>
          <div className="h-4 w-4 rounded-full bg-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{menuStats.activeItems}</div>
          <p className="text-muted-foreground text-xs">
            {Math.round((menuStats.activeItems / menuStats.totalItems) * 100)}%
            of total items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <div className="h-4 w-4 rounded bg-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{menuStats.totalCategories}</div>
          <p className="text-muted-foreground text-xs">
            Main, Soups, Sides, Starters
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {menuStats.soldOutItems + menuStats.lowStockItems}
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="destructive" className="text-xs">
              {menuStats.soldOutItems} Sold Out
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {menuStats.lowStockItems} Low Stock
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
