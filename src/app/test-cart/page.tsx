'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
import { generateId } from '@/utils';
import type { CartItem } from '@/types';

export default function TestCartPage() {
  const { addItem, items, getTotalItems, getSubtotal, getTotal } =
    useCartStore();
  const [addedItems, setAddedItems] = useState<number>(0);

  const addTestItem = () => {
    const testItem: CartItem = {
      id: generateId(),
      menuItemId: `test-item-${addedItems + 1}`,
      name: `Test Item ${addedItems + 1}`,
      image: '/placeholder-food.svg',
      quantity: 1,
      selectedCustomizations: [],
      specialInstructions: `Test item ${addedItems + 1}`,
      unitPrice: 15.99,
      totalPrice: 15.99,
    };

    addItem(testItem);
    setAddedItems(prev => prev + 1);
  };

  const addExpensiveItem = () => {
    const expensiveItem: CartItem = {
      id: generateId(),
      menuItemId: `expensive-item-${addedItems + 1}`,
      name: `Expensive Test Item ${addedItems + 1}`,
      image: '/placeholder-food.svg',
      quantity: 1,
      selectedCustomizations: [],
      specialInstructions: `Expensive test item ${addedItems + 1}`,
      unitPrice: 35.99,
      totalPrice: 35.99,
    };

    addItem(expensiveItem);
    setAddedItems(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cart Testing Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={addTestItem}>Add Test Item ($15.99)</Button>
              <Button onClick={addExpensiveItem} variant="outline">
                Add Expensive Item ($35.99)
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-2 font-semibold">Cart Summary:</h3>
              <div className="space-y-1 text-sm">
                <p>Total Items: {getTotalItems()}</p>
                <p>Subtotal: ${getSubtotal().toFixed(2)}</p>
                <p>Total: ${getTotal().toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-2 font-semibold">Items in Cart:</h3>
              {items.length === 0 ? (
                <p className="text-gray-500">No items in cart</p>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <div>
                        <p className="font-medium">
                          Menu Item {item.menuItemId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Click the cart icon in the top navigation to open the cart
                sidebar and test the checkout functionality.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
