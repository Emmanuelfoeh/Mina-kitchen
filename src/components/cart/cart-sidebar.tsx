'use client';

import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Wifi,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartSafe } from './cart-provider';
import { formatCurrency } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceBreakdown } from './price-breakdown';
import { useEffect, useRef } from 'react';
import { trapFocus, announceToScreenReader } from '@/lib/accessibility';
import type { CartItem, SelectedCustomization } from '@/types';

export function CartSidebar() {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    items,
    isOpen,
    toggleCart,
    closeCart,
    removeItem,
    updateQuantity,
    isSyncing,
    syncError,
    isAuthenticated,
  } = useCartSafe();

  // Compute values directly from items to ensure reactivity
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const hasCartItems = items.length > 0;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
    announceToScreenReader('Navigating to checkout page');
  };

  const handleClose = () => {
    toggleCart();
    announceToScreenReader('Cart closed');
  };

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const cleanup = trapFocus(sidebarRef.current);
      return cleanup;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 z-50 flex h-screen w-full max-w-md transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-describedby="cart-description"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <h2 id="cart-title" className="text-lg font-semibold">
              Your Cart
            </h2>
            {totalItems > 0 && (
              <Badge
                variant="secondary"
                aria-label={`${totalItems} items in cart`}
              >
                {totalItems}
              </Badge>
            )}

            {/* Sync Status Indicator */}
            {isAuthenticated && (
              <div className="flex items-center gap-1">
                {isSyncing ? (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <div className="h-3 w-3 animate-spin rounded-full border-b border-blue-600"></div>
                    <span>Syncing...</span>
                  </div>
                ) : syncError ? (
                  <div
                    className="flex items-center gap-1 text-xs text-red-600"
                    title={syncError}
                  >
                    <WifiOff className="h-3 w-3" />
                    <span>Sync Error</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Wifi className="h-3 w-3" />
                    <span>Synced</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div id="cart-description" className="sr-only">
          Shopping cart containing {totalItems}{' '}
          {totalItems === 1 ? 'item' : 'items'}
        </div>

        {/* Cart Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          {!hasCartItems ? (
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
  // Comprehensive mapping for customization names based on common patterns
  const formatCustomizationName = (customizationId: string): string => {
    // Create a mapping of common customization patterns to readable names
    const customizationMap: Record<string, string> = {
      // Spice/Heat related
      'pepper-level': 'Pepper Level',
      'spice-level': 'Spice Level',
      'heat-level': 'Heat Level',

      // Meat/Protein related
      'meat-selection': 'Meat Selection',
      'extra-meat': 'Extra Meat',
      'protein-choice': 'Protein Choice',

      // Preparation styles
      'preparation-style': 'Preparation Style',
      'cooking-style': 'Cooking Style',

      // Add-ons and extras
      'add-ons': 'Add-ons',
      extras: 'Extras',
      'additional-items': 'Additional Items',

      // Special instructions
      'special-instructions': 'Special Instructions',
      notes: 'Notes',
      comments: 'Comments',
    };

    // First check direct mapping
    const lowerCaseId = customizationId.toLowerCase();
    for (const [key, value] of Object.entries(customizationMap)) {
      if (lowerCaseId.includes(key)) {
        return value;
      }
    }

    // Pattern-based matching for CUID IDs
    if (customizationId.match(/^c[a-z0-9]{20,}/)) {
      // This is likely a CUID, try to infer from common patterns
      if (lowerCaseId.includes('pepper') || lowerCaseId.includes('spice')) {
        return 'Spice Level';
      }
      if (lowerCaseId.includes('heat')) {
        return 'Heat Level';
      }
      if (lowerCaseId.includes('meat') || lowerCaseId.includes('protein')) {
        return 'Meat Selection';
      }
      if (
        lowerCaseId.includes('preparation') ||
        lowerCaseId.includes('style')
      ) {
        return 'Preparation Style';
      }
      if (lowerCaseId.includes('add') || lowerCaseId.includes('extra')) {
        return 'Add-ons';
      }
      if (lowerCaseId.includes('instruction') || lowerCaseId.includes('note')) {
        return 'Special Instructions';
      }

      // Default for unrecognized CUIDs
      return 'Customization';
    }

    // Fallback: clean up the ID to make it readable
    return (
      customizationId
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim() || 'Customization'
    );
  };

  const formatOptionName = (optionId: string): string => {
    // Create a comprehensive mapping for option names
    const optionMap: Record<string, string> = {
      // Spice levels
      low: 'Mild',
      mild: 'Mild',
      medium: 'Medium',
      hot: 'Hot',
      extra: 'Hot',
      'extra-hot': 'Extra Hot',
      'african-hot': 'African Hot',

      // Cooking methods
      boiled: 'Boiled',
      fried: 'Fried',
      grilled: 'Grilled',
      steamed: 'Steamed',
      roasted: 'Roasted',

      // Sizes and portions
      regular: 'Regular',
      large: 'Large',
      small: 'Small',
      'extra-large': 'Extra Large',

      // Meat types
      beef: 'Beef',
      chicken: 'Chicken',
      fish: 'Fish',
      'goat-meat': 'Goat Meat',
      stockfish: 'Stockfish',
      'dried-fish': 'Dried Fish',
      catfish: 'Catfish',

      // Extras
      'extra-chicken': 'Extra Chicken',
      'extra-beef': 'Extra Beef',
      'extra-goat-meat': 'Extra Goat Meat',
      'add-fish': 'Add Fish',
      'extra-onions': 'Extra Onions',
      'extra-tomatoes': 'Extra Tomatoes',
      'yaji-spice': 'Yaji Spice',
      'boiled-egg': 'Boiled Egg',

      // Preparation styles
      'regular-cut': 'Regular Cut',
      'thick-cut': 'Thick Cut',
      diced: 'Diced',
      chunky: 'Chunky',
      chips: 'Chips',

      // Common options
      none: 'None',
      mixed: 'Mixed',
      yes: 'Yes',
      no: 'No',
    };

    // First check direct mapping
    const lowerCaseId = optionId.toLowerCase();
    if (optionMap[lowerCaseId]) {
      return optionMap[lowerCaseId];
    }

    // Handle numbered options (like "4-pieces", "6-pieces")
    if (optionId.includes('pieces') || optionId.includes('piece')) {
      return optionId
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Handle CUID options - these should ideally not happen, but provide fallback
    if (optionId.match(/^c[a-z0-9]{20,}/)) {
      return 'Selected Option';
    }

    // Fallback: clean up the ID to make it readable
    return (
      optionId
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim() || optionId
    );
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {/* Item Image */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
          <img
            src={item.image || '/placeholder-food.svg'}
            alt={item.name || 'Menu Item'}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Item Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">
            {item.name || 'Menu Item'}
          </h3>
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
                        {customization.customizationName ||
                          formatCustomizationName(
                            customization.customizationId
                          )}
                        :
                      </span>
                      {customization.optionIds.length > 0 && (
                        <span className="ml-1">
                          {customization.optionNames?.length
                            ? customization.optionNames.join(', ')
                            : customization.optionIds
                                .map(formatOptionName)
                                .join(', ')}
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
