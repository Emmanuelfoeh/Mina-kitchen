'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import type { MenuItem, PackageItem } from '@/types';

interface PackageItemsBuilderProps {
  menuItems: MenuItem[];
  packageItems: PackageItem[];
  onItemsChange: (items: PackageItem[]) => void;
}

export function PackageItemsBuilder({
  menuItems,
  packageItems,
  onItemsChange,
}: PackageItemsBuilderProps) {
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const addPackageItem = () => {
    if (!selectedMenuItemId) return;

    const existingItemIndex = packageItems.findIndex(
      item => item.menuItemId === selectedMenuItemId
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...packageItems];
      updatedItems[existingItemIndex].quantity += quantity;
      onItemsChange(updatedItems);
    } else {
      // Add new item
      const newItem: PackageItem = {
        menuItemId: selectedMenuItemId,
        quantity,
        includedCustomizations: [],
      };
      onItemsChange([...packageItems, newItem]);
    }

    setSelectedMenuItemId('');
    setQuantity(1);
  };

  const removePackageItem = (index: number) => {
    const updatedItems = packageItems.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = [...packageItems];
    updatedItems[index].quantity = newQuantity;
    onItemsChange(updatedItems);
  };

  const getMenuItemById = (id: string) => {
    return menuItems.find(item => item.id === id);
  };

  const calculateTotalPrice = () => {
    return packageItems.reduce((total, item) => {
      const menuItem = getMenuItemById(item.menuItemId);
      return total + (menuItem?.basePrice || 0) * item.quantity;
    }, 0);
  };

  const availableMenuItems = menuItems.filter(
    item =>
      !packageItems.some(packageItem => packageItem.menuItemId === item.id)
  );

  return (
    <div className="space-y-6">
      {/* Add Item Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Menu Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select
                value={selectedMenuItemId}
                onValueChange={setSelectedMenuItemId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select menu item" />
                </SelectTrigger>
                <SelectContent>
                  {availableMenuItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex w-full items-center justify-between">
                        <span>{item.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ${item.basePrice.toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addPackageItem}
                disabled={!selectedMenuItemId}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Package Contents</CardTitle>
        </CardHeader>
        <CardContent>
          {packageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Package className="mb-2 h-8 w-8" />
              <p>No items added to package yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {packageItems.map((item, index) => {
                const menuItem = getMenuItemById(item.menuItemId);
                if (!menuItem) return null;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{menuItem.name}</h4>
                        <p className="text-sm text-gray-500">
                          {menuItem.category.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary">
                            ${menuItem.basePrice.toFixed(2)} each
                          </Badge>
                          <Badge variant="outline">
                            Total: $
                            {(menuItem.basePrice * item.quantity).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Qty:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e =>
                            updateQuantity(index, parseInt(e.target.value) || 1)
                          }
                          className="w-20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePackageItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Total Summary */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Items:{' '}
                      {packageItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Individual Price Total: $
                      {calculateTotalPrice().toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Package will save customers:
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      $
                      {(
                        calculateTotalPrice() -
                        (packageItems.length > 0
                          ? calculateTotalPrice() * 0.85
                          : 0)
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      (Estimated 15% savings)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
