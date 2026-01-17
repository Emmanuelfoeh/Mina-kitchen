'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditCategoryModal } from './edit-category-modal';

interface Category {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  _count: {
    menuItems: number;
  };
}

interface CategoriesManagerProps {
  key?: number;
}

export function CategoriesManager({ key }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [key]);

  async function fetchCategories() {
    try {
      const response = await fetch(
        '/api/admin/menu/categories?includeInactive=true'
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category._count.menuItems > 0) {
      alert(
        `Cannot delete "${category.name}" because it has ${category._count.menuItems} menu item(s). Please move or delete the menu items first.`
      );
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/menu/categories/${category.id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh categories list
        fetchCategories();
      } else {
        throw new Error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to delete category'
      );
    }
  };

  const handleCategoryUpdated = () => {
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 p-4">
            <div className="h-4 w-4 rounded bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 p-4">
            <div className="h-4 w-4 rounded bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {categories.length > 0 ? (
          categories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-sm font-medium text-gray-600">
                  {category.displayOrder}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge
                      variant={category.isActive ? 'default' : 'secondary'}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {category._count.menuItems} items
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Category
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            No categories found. Create your first category to get started.
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      <EditCategoryModal
        category={editingCategory}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </>
  );
}
