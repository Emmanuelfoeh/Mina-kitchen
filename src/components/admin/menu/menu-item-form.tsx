'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { X } from 'lucide-react';

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuItemData {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'LOW_STOCK';
  tags: string;
  category: {
    id: string;
    name: string;
  };
}

interface MenuItemFormProps {
  initialData?: MenuItemData;
  isEditing?: boolean;
}

export function MenuItemForm({
  initialData,
  isEditing = false,
}: MenuItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    image: initialData?.image || '',
    status: initialData?.status || ('ACTIVE' as const),
    categoryId: initialData?.category.id || '',
  });

  useEffect(() => {
    // Parse initial tags
    if (initialData?.tags) {
      try {
        const parsedTags = JSON.parse(initialData.tags);
        setTags(parsedTags);
      } catch {
        setTags([]);
      }
    }

    // Fetch categories
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/menu/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    fetchCategories();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: tags,
      };

      const url = isEditing
        ? `/api/admin/menu/items/${initialData?.id}`
        : '/api/admin/menu/items';

      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/admin/menu');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to save menu item');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to save menu item'
      );
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={value =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="basePrice">Base Price *</Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.basePrice}
            onChange={e =>
              setFormData({
                ...formData,
                basePrice: parseFloat(e.target.value) || 0,
              })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
              <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <ImageUpload
          value={formData.image}
          onChange={url => setFormData({ ...formData, image: url })}
          onRemove={() => setFormData({ ...formData, image: '' })}
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Upload a high-quality image of your menu item. This will be displayed
          to customers.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
