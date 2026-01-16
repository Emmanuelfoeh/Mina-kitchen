'use client';

import { useState } from 'react';
import { GripVertical, Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockCategories } from '@/lib/mock-data';
import type { MenuCategory } from '@/types';

export function CategoriesManager() {
  const [categories, setCategories] = useState<MenuCategory[]>(
    [...mockCategories].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Form state for new/edit category
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
    setEditingCategory(null);
    setIsAddingNew(false);
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      // Update existing category
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat
        )
      );
    } else {
      // Add new category
      const newCategory: MenuCategory = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        displayOrder: categories.length + 1,
        isActive: formData.isActive,
      };
      setCategories(prev => [...prev, newCategory]);
    }

    resetForm();
  };

  const handleDelete = (categoryId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];

    // Remove dragged item
    newCategories.splice(draggedItem, 1);

    // Insert at new position
    newCategories.splice(dropIndex, 0, draggedCategory);

    // Update display orders
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      displayOrder: index + 1,
    }));

    setCategories(updatedCategories);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Add New Category Button */}
      <div className="flex justify-end">
        <Dialog
          open={isAddingNew || !!editingCategory}
          onOpenChange={open => !open && resetForm()}
        >
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Main Dishes"
                />
              </div>
              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={formData.isActive}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="categoryActive">
                  Active (visible to customers)
                </Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-[#f97316] hover:bg-[#ea580c]"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className={`transition-all duration-200 ${
              draggedItem === index ? 'scale-95 opacity-50' : 'hover:shadow-md'
            }`}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>

                {/* Category Info */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge
                      variant={category.isActive ? 'default' : 'secondary'}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Order: {category.displayOrder}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(category.id)}
                    className="gap-1"
                  >
                    {category.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="gap-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-4 text-gray-500">No categories yet</p>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Category
          </Button>
        </div>
      )}
    </div>
  );
}
