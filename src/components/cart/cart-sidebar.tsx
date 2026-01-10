'use client';

import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartSafe } from './cart-provider';
import { formatCurrency } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceBreakdown } from './price-breakdown';
import type { CartItem, SelectedCustomization } from '@/types';

export function CartSidebar() {
  const router = useRouter();
  const {
    items,
    isOpen,
    toggleCart,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalItems,
    hasItems,
  } = useCartSafe();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 z-50 flex h-screen w-full max-w-md transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Your Cart</h2>
            {getTotalItems() > 0 && (
              <Badge variant="secondary">{getTotalItems()}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={toggleCart}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          {!hasItems() ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-4 text-gray-500">Your cart is empty</p>
                <Button onClick={toggleCart}>Continue Shopping</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items - Scrollable area */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {items.map(item => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                    onUpdateQuantity={quantity =>
                      updateQuantity(item.id, quantity)
                    }
                  />
                ))}
              </div>

              {/* Price Summary - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-white p-4">
                <PriceBreakdown />
              </div>

              {/* Checkout Button - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-white p-4">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

function CartItemCard({ item, onRemove, onUpdateQuantity }: CartItemCardProps) {
  // Try to find the menu item from mock data to get better display info
  const getMenuItemInfo = (menuItemId: string) => {
    // For now, we'll create a simple display name from the ID
    // In a real app, this would fetch from the menu items data
    if (menuItemId.startsWith('package-')) {
      return {
        name: menuItemId
          .replace('package-', '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
        image:
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
        isPackage: true,
      };
    } else if (menuItemId.startsWith('side-')) {
      return {
        name: menuItemId
          .replace('side-', '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
        image:
          'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=300&q=80',
        isPackage: false,
      };
    } else {
      return {
        name: `Menu Item ${menuItemId}`,
        image:
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80',
        isPackage: false,
      };
    }
  };

  const menuItemInfo = getMenuItemInfo(item.menuItemId);

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {/* Item Image */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
          <img
            src={menuItemInfo.image}
            alt={menuItemInfo.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Item Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{menuItemInfo.name}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {formatCurrency(item.unitPrice)} each
          </p>

          {/* Customizations */}
          {item.selectedCustomizations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600">
                Customizations:
              </p>
              <div className="mt-1 space-y-1">
                {item.selectedCustomizations.map(
                  (customization: SelectedCustomization, index: number) => (
                    <div key={index} className="text-xs text-gray-500">
                      <span className="font-medium">
                        {customization.customizationId}:
                      </span>
                      {customization.optionIds.length > 0 && (
                        <span className="ml-1">
                          {customization.optionIds.join(', ')}
                        </span>
                      )}
                      {customization.textValue && (
                        <span className="ml-1 italic">
                          "{customization.textValue}"
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {item.specialInstructions && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600">
                Special Instructions:
              </p>
              <p className="mt-1 text-xs text-gray-500 italic">
                {item.specialInstructions}
              </p>
            </div>
          )}

          {/* Package indicator */}
          {menuItemInfo.isPackage && (
            <div className="mt-1">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                Package Deal
              </span>
            </div>
          )}
        </div>

        {/* Price and Controls */}
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm font-semibold">
            {formatCurrency(item.totalPrice)}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 p-1 text-red-500 hover:text-red-700"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
