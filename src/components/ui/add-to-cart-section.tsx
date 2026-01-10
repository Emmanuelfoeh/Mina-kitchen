'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { TouchTarget } from '@/components/ui/touch-target';
import { Plus, Minus, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { formatCurrency, generateId } from '@/utils';
import { useCartStore } from '@/stores/cart-store';
import {
  announceCartOperation,
  announceFormSuccess,
} from '@/lib/screen-reader';
import { useCartTracking } from '@/hooks/use-analytics';
import type {
  MenuItem,
  Package,
  SelectedCustomization,
  CartItem,
} from '@/types';

interface AddToCartSectionProps {
  item: MenuItem | Package;
  selectedCustomizations?: SelectedCustomization[];
  specialInstructions?: string;
  disabled?: boolean;
  onAddToCart?: (cartItem: CartItem) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FeedbackState {
  type: 'success' | 'error' | null;
  message: string;
}

export function AddToCartSection({
  item,
  selectedCustomizations = [],
  specialInstructions,
  disabled = false,
  onAddToCart,
  onSuccess,
  onError,
}: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: '',
  });

  const { addItem, openCart } = useCartStore();

  // Initialize analytics tracking
  const { trackAddToCart } = useCartTracking();

  // Calculate total price including customizations
  const calculateTotalPrice = (): number => {
    let basePrice = 0;
    let customizationPrice = 0;

    // Handle both MenuItem and Package types
    if ('basePrice' in item) {
      basePrice = item.basePrice;

      // Calculate customization price for menu items
      selectedCustomizations.forEach(selected => {
        const customization = item.customizations?.find(
          c => c.id === selected.customizationId
        );
        if (customization) {
          selected.optionIds.forEach(optionId => {
            const option = customization.options.find(o => o.id === optionId);
            if (option) {
              customizationPrice += option.priceModifier;
            }
          });
        }
      });
    } else {
      // Package price is already calculated
      basePrice = item.price;
    }

    return (basePrice + customizationPrice) * quantity;
  };

  const totalPrice = calculateTotalPrice();
  const unitPrice = totalPrice / quantity;

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (feedback.type) {
      const timer = setTimeout(() => {
        setFeedback({ type: null, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (disabled || isAddingToCart) return;

    setIsAddingToCart(true);
    setFeedback({ type: null, message: '' });

    try {
      const cartItem: CartItem = {
        id: generateId(),
        menuItemId: item.id,
        quantity,
        selectedCustomizations,
        specialInstructions: specialInstructions || undefined,
        unitPrice,
        totalPrice,
      };

      if (onAddToCart) {
        await onAddToCart(cartItem);
      } else {
        addItem(cartItem);
      }

      // Track analytics for cart conversion
      trackAddToCart(
        item,
        quantity,
        unitPrice,
        totalPrice,
        selectedCustomizations,
        Boolean(specialInstructions?.trim()),
        'detail_page'
      );

      // Show success feedback
      setFeedback({
        type: 'success',
        message: `Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`,
      });

      // Announce to screen readers
      const itemName = 'basePrice' in item ? item.name : `${item.name} package`;
      announceCartOperation('added', itemName, quantity);
      announceFormSuccess('Add to cart', `${itemName} added successfully`);

      // Reset quantity after successful add
      setQuantity(1);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add item to cart';

      setFeedback({
        type: 'error',
        message: errorMessage,
      });

      // Call error callback
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewCart = () => {
    openCart();
  };

  const isItemAvailable = () => {
    if ('basePrice' in item) {
      // MenuItem
      return item.status === 'active' || item.status === 'low_stock';
    } else {
      // Package
      return item.isActive;
    }
  };

  const getButtonText = () => {
    if (isAddingToCart) return 'Adding...';
    if (!isItemAvailable()) {
      if ('basePrice' in item && item.status === 'sold_out') {
        return 'Sold Out';
      }
      return 'Currently Unavailable';
    }
    return `Add to Cart - ${formatCurrency(totalPrice)}`;
  };

  const isButtonDisabled = () => {
    return disabled || !isItemAvailable() || isAddingToCart;
  };

  return (
    <div className="space-y-4" role="region" aria-label="Add to cart">
      {/* Quantity and Price Section */}
      <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <Label
              className="text-sm font-semibold text-gray-900 sm:text-base"
              htmlFor="quantity-display"
            >
              Quantity:
            </Label>
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label="Quantity selector"
            >
              <TouchTarget
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={disabled || quantity <= 1}
                className="h-10 w-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 sm:h-12 sm:w-12"
                aria-label="Decrease quantity"
                size="sm"
                variant="outline"
              >
                <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
              </TouchTarget>
              <div
                className="flex h-10 w-14 items-center justify-center rounded border bg-white text-center text-sm font-semibold sm:h-12 sm:w-16 sm:text-base"
                id="quantity-display"
                role="spinbutton"
                aria-valuenow={quantity}
                aria-valuemin={1}
                aria-valuemax={99}
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </div>
              <TouchTarget
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={disabled || quantity >= 99}
                className="h-10 w-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 sm:h-12 sm:w-12"
                aria-label="Increase quantity"
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </TouchTarget>
            </div>
          </div>

          {/* Price Display */}
          <div
            className="text-center sm:text-right"
            role="group"
            aria-label="Price information"
          >
            <div className="text-xs text-gray-600 sm:text-sm">Total</div>
            <div
              className="text-xl font-bold text-green-600 sm:text-2xl"
              aria-label={`Total price: ${formatCurrency(totalPrice)}`}
            >
              {formatCurrency(totalPrice)}
            </div>
            {quantity > 1 && (
              <div
                className="text-xs text-gray-500"
                aria-label={`Price per item: ${formatCurrency(unitPrice)}`}
              >
                {formatCurrency(unitPrice)} each
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback.type && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback.type === 'success' ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isButtonDisabled()}
          className={`w-full text-sm sm:text-base ${
            isButtonDisabled()
              ? 'cursor-not-allowed bg-gray-300 text-gray-500'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          size="lg"
          aria-describedby={feedback.type ? 'cart-feedback' : undefined}
          aria-label={
            isButtonDisabled()
              ? getButtonText()
              : `Add ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart for ${formatCurrency(totalPrice)}`
          }
        >
          <ShoppingCart
            className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
            aria-hidden="true"
          />
          {getButtonText()}
        </Button>

        {/* View Cart Button - Only show after successful add */}
        {feedback.type === 'success' && (
          <Button
            onClick={handleViewCart}
            variant="outline"
            className="w-full"
            size="lg"
            aria-label="View shopping cart"
          >
            View Cart
          </Button>
        )}
      </div>

      {/* Item Status Badge */}
      {!isItemAvailable() && (
        <div className="flex justify-center">
          <Badge
            variant="destructive"
            className="text-sm"
            role="status"
            aria-label={`Item status: ${
              'basePrice' in item && item.status === 'sold_out'
                ? 'Sold out'
                : 'Currently unavailable'
            }`}
          >
            {'basePrice' in item && item.status === 'sold_out'
              ? 'Sold Out'
              : 'Currently Unavailable'}
          </Badge>
        </div>
      )}

      {/* Quantity Limit Warning */}
      {quantity >= 10 && (
        <div
          className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-700"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>
              Large quantity selected. For bulk orders, please contact us
              directly.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
