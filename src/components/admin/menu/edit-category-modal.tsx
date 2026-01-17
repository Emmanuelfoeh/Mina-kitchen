'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface EditCategoryModalProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryUpdated?: () => void;
}

export function EditCategoryModal({
  category,
  open,
  onOpenChange,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/menu/categories/${category.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            displayOrder: formData.displayOrder,
            isActive: formData.isActive,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Close modal
        onOpenChange(false);

        // Notify parent to refresh
        onCategoryUpdated?.();
      } else {
        throw new Error(result.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update category error:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to update category'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    }
    onOpenChange(false);
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Category Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Dishes, Appetizers"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this category"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-displayOrder">Display Order</Label>
            <Input
              id="edit-displayOrder"
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={e =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first in the menu
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={checked =>
                setFormData({ ...formData, isActive: !!checked })
              }
              disabled={loading}
            />
            <Label htmlFor="edit-isActive" className="text-sm font-normal">
              Active (visible in menu)
            </Label>
          </div>

          {category._count.menuItems > 0 && (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                This category has {category._count.menuItems} menu item(s)
                associated with it.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
