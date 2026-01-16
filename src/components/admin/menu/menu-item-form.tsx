'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCategories } from '@/lib/mock-data';
import type { MenuItem, Customization, CustomizationOption } from '@/types';

interface MenuItemFormProps {
  initialData?: Partial<MenuItem>;
  isEditing?: boolean;
}

export function MenuItemForm({
  initialData,
  isEditing = false,
}: MenuItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    categoryId: initialData?.category?.id || '',
    status: initialData?.status || 'active',
    image: initialData?.image || '',
    tags: initialData?.tags || [],
    chefNotes: initialData?.chefNotes || '',
    preparationTime: initialData?.preparationTime || 30,
    allergens: initialData?.allergens || [],
  });

  const [customizations, setCustomizations] = useState<Customization[]>(
    initialData?.customizations || []
  );

  const [nutritionalInfo, setNutritionalInfo] = useState({
    calories: initialData?.nutritionalInfo?.calories || 0,
    protein: initialData?.nutritionalInfo?.protein || 0,
    carbs: initialData?.nutritionalInfo?.carbs || 0,
    fat: initialData?.nutritionalInfo?.fat || 0,
    fiber: initialData?.nutritionalInfo?.fiber || 0,
    sodium: initialData?.nutritionalInfo?.sodium || 0,
  });

  const [newTag, setNewTag] = useState('');
  const [newAllergen, setNewAllergen] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddAllergen = () => {
    if (
      newAllergen.trim() &&
      !formData.allergens.includes(newAllergen.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, newAllergen.trim()],
      }));
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergenToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(
        allergen => allergen !== allergenToRemove
      ),
    }));
  };

  const handleAddCustomization = () => {
    const newCustomization: Customization = {
      id: `custom-${Date.now()}`,
      name: 'New Customization',
      type: 'radio',
      required: false,
      options: [],
    };
    setCustomizations(prev => [...prev, newCustomization]);
  };

  const handleUpdateCustomization = (
    index: number,
    updates: Partial<Customization>
  ) => {
    setCustomizations(prev =>
      prev.map((custom, i) =>
        i === index ? { ...custom, ...updates } : custom
      )
    );
  };

  const handleRemoveCustomization = (index: number) => {
    setCustomizations(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomizationOption = (customizationIndex: number) => {
    const newOption: CustomizationOption = {
      id: `option-${Date.now()}`,
      name: 'New Option',
      priceModifier: 0,
      isAvailable: true,
    };

    setCustomizations(prev =>
      prev.map((custom, i) =>
        i === customizationIndex
          ? { ...custom, options: [...custom.options, newOption] }
          : custom
      )
    );
  };

  const handleUpdateCustomizationOption = (
    customizationIndex: number,
    optionIndex: number,
    updates: Partial<CustomizationOption>
  ) => {
    setCustomizations(prev =>
      prev.map((custom, i) =>
        i === customizationIndex
          ? {
              ...custom,
              options: custom.options.map((option, j) =>
                j === optionIndex ? { ...option, ...updates } : option
              ),
            }
          : custom
      )
    );
  };

  const handleRemoveCustomizationOption = (
    customizationIndex: number,
    optionIndex: number
  ) => {
    setCustomizations(prev =>
      prev.map((custom, i) =>
        i === customizationIndex
          ? {
              ...custom,
              options: custom.options.filter((_, j) => j !== optionIndex),
            }
          : custom
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        customizations: customizations.map(custom => ({
          ...custom,
          type: custom.type.toUpperCase() as 'RADIO' | 'CHECKBOX' | 'TEXT',
        })),
        nutritionalInfo,
        status: formData.status.toUpperCase() as
          | 'ACTIVE'
          | 'INACTIVE'
          | 'SOLD_OUT'
          | 'LOW_STOCK',
      };

      const url = isEditing
        ? `/api/admin/menu/items/${(initialData as any)?.id}`
        : '/api/admin/menu/items';

      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success message (you can add toast notification here)
        console.log('Menu item saved successfully:', result.data);

        // Redirect back to menu management
        router.push('/admin/menu');
      } else {
        throw new Error(result.error || 'Failed to save menu item');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to save menu item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="e.g., Smokey Jollof Rice"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={value => handleInputChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="basePrice">Base Price *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.basePrice}
              onChange={e =>
                handleInputChange('basePrice', parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={value => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="sold_out">Sold Out</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={e => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
            <Input
              id="preparationTime"
              type="number"
              min="1"
              value={formData.preparationTime}
              onChange={e =>
                handleInputChange(
                  'preparationTime',
                  parseInt(e.target.value) || 30
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
          placeholder="Describe the dish, ingredients, and what makes it special..."
          rows={3}
          required
        />
      </div>

      {/* Chef Notes */}
      <div>
        <Label htmlFor="chefNotes">Chef's Notes</Label>
        <Textarea
          id="chefNotes"
          value={formData.chefNotes}
          onChange={e => handleInputChange('chefNotes', e.target.value)}
          placeholder="Special preparation notes, recommendations, or chef's insights..."
          rows={2}
        />
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="mb-2 flex gap-2">
          <Input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={e =>
              e.key === 'Enter' && (e.preventDefault(), handleAddTag())
            }
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Allergens */}
      <div>
        <Label>Allergens</Label>
        <div className="mb-2 flex gap-2">
          <Input
            value={newAllergen}
            onChange={e => setNewAllergen(e.target.value)}
            placeholder="Add an allergen..."
            onKeyPress={e =>
              e.key === 'Enter' && (e.preventDefault(), handleAddAllergen())
            }
          />
          <Button type="button" onClick={handleAddAllergen} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.allergens.map(allergen => (
            <Badge key={allergen} variant="destructive" className="gap-1">
              {allergen}
              <button
                type="button"
                onClick={() => handleRemoveAllergen(allergen)}
                className="ml-1 hover:text-red-800"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Nutritional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Nutritional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={nutritionalInfo.calories}
                onChange={e =>
                  setNutritionalInfo(prev => ({
                    ...prev,
                    calories: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                min="0"
                value={nutritionalInfo.protein}
                onChange={e =>
                  setNutritionalInfo(prev => ({
                    ...prev,
                    protein: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                min="0"
                value={nutritionalInfo.carbs}
                onChange={e =>
                  setNutritionalInfo(prev => ({
                    ...prev,
                    carbs: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                min="0"
                value={nutritionalInfo.fat}
                onChange={e =>
                  setNutritionalInfo(prev => ({
                    ...prev,
                    fat: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                min="0"
                value={nutritionalInfo.fiber}
                onChange={e =>
                  setNutritionalInfo(prev => ({
                    ...prev,
                    fiber: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="sodium">Sodium (mg)</Label>
              <Input
                id="sodium"
                type="number"
                step="0.1"
                min="0"
                value={nutritionalInfo.sodium}
                onChange={e =>
                  setNutritionalInfo(prev => ({
                    ...prev,
                    sodium: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customizations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customizations</CardTitle>
          <Button
            type="button"
            onClick={handleAddCustomization}
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customization
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {customizations.map((customization, customIndex) => (
            <div
              key={customization.id}
              className="space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Customization {customIndex + 1}</h4>
                <Button
                  type="button"
                  onClick={() => handleRemoveCustomization(customIndex)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={customization.name}
                    onChange={e =>
                      handleUpdateCustomization(customIndex, {
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Pepper Level"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={customization.type}
                    onValueChange={(value: 'radio' | 'checkbox' | 'text') =>
                      handleUpdateCustomization(customIndex, { type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radio">Single Choice</SelectItem>
                      <SelectItem value="checkbox">Multiple Choice</SelectItem>
                      <SelectItem value="text">Text Input</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`required-${customIndex}`}
                    checked={customization.required}
                    onChange={e =>
                      handleUpdateCustomization(customIndex, {
                        required: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor={`required-${customIndex}`}>Required</Label>
                </div>
              </div>

              {customization.type !== 'text' && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      onClick={() => handleAddCustomizationOption(customIndex)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customization.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Input
                          value={option.name}
                          onChange={e =>
                            handleUpdateCustomizationOption(
                              customIndex,
                              optionIndex,
                              { name: e.target.value }
                            )
                          }
                          placeholder="Option name"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={option.priceModifier}
                          onChange={e =>
                            handleUpdateCustomizationOption(
                              customIndex,
                              optionIndex,
                              { priceModifier: parseFloat(e.target.value) || 0 }
                            )
                          }
                          placeholder="Price"
                          className="w-24"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            handleRemoveCustomizationOption(
                              customIndex,
                              optionIndex
                            )
                          }
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#f97316] hover:bg-[#ea580c]"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
