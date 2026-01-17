'use client';

import { Suspense, useState, useCallback } from 'react';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoriesManager } from '@/components/admin/menu/categories-manager';
import { AddCategoryModal } from '@/components/admin/menu/add-category-modal';
import Link from 'next/link';

export default function CategoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategoryAdded = useCallback(() => {
    // Force refresh of the categories list
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/menu">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Category Management
            </h1>
            <p className="text-gray-500">
              Organize your menu categories and display order
            </p>
          </div>
        </div>
        <AddCategoryModal onCategoryAdded={handleCategoryAdded} />
      </div>

      {/* Categories Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-gray-400" />
            Menu Categories
          </CardTitle>
          <p className="text-sm text-gray-500">
            Drag and drop to reorder categories. The order here determines how
            they appear on your menu.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading categories...</div>}>
            <CategoriesManager key={refreshKey} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
