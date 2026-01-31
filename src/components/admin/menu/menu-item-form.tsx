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
import { CustomizationBuilder } from './customization-builder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Info } from 'lucide-react';
import { toast } from 'sonner';

interface MenuCategory {
  id: string;
  name: string;
}

interface CustomizationOption {
  id: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
}

interface Customization {
  id: string;
  name: string;
  type: 'radio' | 'checkbox' | 'text';
  required: boolean;
  maxSelections?: number;
  options: CustomizationOption[];
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
  customizations?: Customization[];
  preparationTime?: number;
  allergens?: string[];
  chefNotes?: string;
  seoTitle?: string;
  seoDescription?: string;
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
  const [allergens, setAllergens] = useState<string[]>([]);
  const [newAllergen, setNewAllergen] = useState('');
  const [customizations, setCustomizations] = useState<Customization[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    image: initialData?.image || '',
    status: initialData?.status || ('ACTIVE' as const),
    categoryId: initialData?.category.id || '',
    preparationTime: initialData?.preparationTime || 0,
    chefNotes: initialData?.chefNotes || '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
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

    // Parse initial allergens
    if (initialData?.allergens) {
      setAllergens(initialData.allergens);
    }

    // Parse initial customizations
    if (initialData?.customizations) {
      setCustomizations(initialData.customizations);
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
        allergens: allergens,
        customizations: customizations,
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
      toast.error(
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

  const addAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen('');
    }
  };

  const removeAllergen = (allergenToRemove: string) => {
    setAllergens(allergens.filter(allergen => allergen !== allergenToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleAllergenKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergen();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="customizations">Customizations</TabsTrigger>
          <TabsTrigger value="seo">SEO & Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
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

                <div className="space-y-2">
                  <Label htmlFor="preparationTime">
                    Preparation Time (minutes)
                  </Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    min="0"
                    value={formData.preparationTime}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        preparationTime: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., 15"
                  />
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
                <Label htmlFor="chefNotes">Chef's Notes</Label>
                <Textarea
                  id="chefNotes"
                  value={formData.chefNotes}
                  onChange={e =>
                    setFormData({ ...formData, chefNotes: e.target.value })
                  }
                  rows={2}
                  placeholder="Special preparation notes, cooking tips, or chef recommendations..."
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
                  Upload a high-quality image of your menu item. This will be
                  displayed to customers.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag (e.g., spicy, vegetarian)"
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

              {/* <div className="space-y-2">
                <Label>Allergens</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAllergen}
                    onChange={e => setNewAllergen(e.target.value)}
                    onKeyPress={handleAllergenKeyPress}
                    placeholder="Add an allergen (e.g., nuts, dairy)"
                  />
                  <Button type="button" onClick={addAllergen} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allergens.map(allergen => (
                    <Badge
                      key={allergen}
                      variant="outline"
                      className="gap-1 border-orange-200 text-orange-700"
                    >
                      {allergen}
                      <button
                        type="button"
                        onClick={() => removeAllergen(allergen)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  List any allergens present in this dish to help customers make
                  informed choices.
                </p>
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu Customizations</CardTitle>
              <p className="text-sm text-gray-600">
                Add customization options that customers can select when
                ordering this item.
              </p>
            </CardHeader>
            <CardContent>
              <CustomizationBuilder
                customizations={customizations}
                onChange={setCustomizations}
                disabled={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Marketing</CardTitle>
              <p className="text-sm text-gray-600">
                Optimize your menu item for search engines and social media
                sharing.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={e =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                  placeholder="e.g., Authentic Jollof Rice - Traditional West African Cuisine"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">
                  Recommended: 50-60 characters. This appears in search results
                  and browser tabs.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={e =>
                    setFormData({ ...formData, seoDescription: e.target.value })
                  }
                  rows={3}
                  placeholder="e.g., Savor our authentic Jollof Rice made with premium ingredients and traditional spices. Order online for delivery or pickup."
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">
                  Recommended: 150-160 characters. This appears in search
                  results and social media previews.
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">SEO Preview</h4>
                    <div className="mt-2 space-y-1">
                      <div className="text-lg text-blue-600 underline">
                        {formData.seoTitle ||
                          formData.name ||
                          'Menu Item Title'}
                      </div>
                      <div className="text-sm text-green-700">
                        minakitchen.ca/menu/items/
                        {formData.name.toLowerCase().replace(/\s+/g, '-')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.seoDescription ||
                          formData.description ||
                          'Menu item description will appear here...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
