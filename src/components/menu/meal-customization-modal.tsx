'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, ShoppingCart, Flame } from 'lucide-react';
import { formatCurrency, generateId } from '@/utils';
import { useCartStore } from '@/stores/cart-store';
import type { MenuItem, SelectedCustomization, CartItem } from '@/types';

interface MealCustomizationModalProps {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export function MealCustomizationModal({
  menuItem,
  isOpen,
  onClose,
}: MealCustomizationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    SelectedCustomization[]
  >([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [totalPrice, setTotalPrice] = useState(menuItem.basePrice);

  const { addItem } = useCartStore();

  // Reset state when modal opens with new item
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedCustomizations([]);
      setSpecialInstructions('');
      setTotalPrice(menuItem.basePrice);
    }
  }, [isOpen, menuItem]);

  // Calculate total price when customizations or quantity change
  useEffect(() => {
    let customizationPrice = 0;

    selectedCustomizations.forEach(selected => {
      const customization = menuItem.customizations.find(
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

    setTotalPrice((menuItem.basePrice + customizationPrice) * quantity);
  }, [selectedCustomizations, quantity, menuItem]);

  const handleCustomizationChange = (
    customizationId: string,
    optionIds: string[],
    textValue?: string
  ) => {
    setSelectedCustomizations(prev => {
      const existing = prev.find(c => c.customizationId === customizationId);

      // Find the customization to get its name
      const customization = menuItem.customizations.find(
        c => c.id === customizationId
      );
      const customizationName = customization?.name;

      // Get option names
      const optionNames = optionIds.map(optionId => {
        const option = customization?.options.find(o => o.id === optionId);
        return option?.name || optionId;
      });

      const newCustomization: SelectedCustomization = {
        customizationId,
        customizationName,
        optionIds,
        optionNames,
        textValue,
      };

      if (existing) {
        return prev.map(c =>
          c.customizationId === customizationId ? newCustomization : c
        );
      } else {
        return [...prev, newCustomization];
      }
    });
  };

  const handleRadioChange = (customizationId: string, optionId: string) => {
    handleCustomizationChange(customizationId, [optionId]);
  };

  const handleCheckboxChange = (
    customizationId: string,
    optionId: string,
    checked: boolean
  ) => {
    const existing = selectedCustomizations.find(
      c => c.customizationId === customizationId
    );
    const currentOptions = existing?.optionIds || [];

    const newOptions = checked
      ? [...currentOptions, optionId]
      : currentOptions.filter(id => id !== optionId);

    handleCustomizationChange(customizationId, newOptions);
  };

  const handleTextChange = (customizationId: string, value: string) => {
    handleCustomizationChange(customizationId, [], value);
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: generateId(),
      menuItemId: menuItem.id,
      name: menuItem.name,
      image: menuItem.image,
      quantity,
      selectedCustomizations,
      specialInstructions: specialInstructions || undefined,
      unitPrice: totalPrice / quantity,
      totalPrice,
    };

    addItem(cartItem);
    onClose();
  };

  const getPepperLevelIcon = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('hot') || lowerLevel.includes('spicy')) {
      return <Flame className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const isRequiredCustomizationMissing = () => {
    return menuItem.customizations.some(customization => {
      if (!customization.required) return false;

      const selected = selectedCustomizations.find(
        s => s.customizationId === customization.id
      );
      if (!selected) return true;

      if (customization.type === 'text') {
        return !selected.textValue?.trim();
      }

      return selected.optionIds.length === 0;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1c100d]">
            Customize Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Menu Item Header */}
          <div className="flex gap-4">
            <div
              className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-200 bg-cover bg-center"
              style={{ backgroundImage: `url('${menuItem.image}')` }}
            />
            <div className="flex-1">
              <h3 className="mb-1 text-xl font-bold text-[#1c100d]">
                {menuItem.name}
              </h3>
              <p className="mb-2 text-sm text-[#5c4a45]">
                {menuItem.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#f2330d]">
                  {formatCurrency(menuItem.basePrice)}
                </span>
                {menuItem.tags.includes('spicy') && (
                  <Badge className="border-0 bg-red-100 text-xs text-red-700">
                    <Flame className="mr-1 h-3 w-3" />
                    Spicy
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Customizations */}
          {menuItem.customizations.map(customization => (
            <div key={customization.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-[#1c100d]">
                  {customization.name}
                </Label>
                {customization.required && (
                  <Badge
                    variant="outline"
                    className="border-[#f2330d] text-xs text-[#f2330d]"
                  >
                    Required
                  </Badge>
                )}
              </div>

              {customization.type === 'radio' && (
                <RadioGroup
                  value={
                    selectedCustomizations.find(
                      s => s.customizationId === customization.id
                    )?.optionIds[0] || ''
                  }
                  onValueChange={value =>
                    handleRadioChange(customization.id, value)
                  }
                >
                  {customization.options.map(option => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{option.name}</span>
                            {getPepperLevelIcon(option.name)}
                          </div>
                          {option.priceModifier !== 0 && (
                            <span className="text-sm font-medium text-[#f2330d]">
                              {option.priceModifier > 0 ? '+' : ''}
                              {formatCurrency(option.priceModifier)}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {customization.type === 'checkbox' && (
                <div className="space-y-2">
                  {customization.options.map(option => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={option.id}
                        checked={
                          selectedCustomizations
                            .find(s => s.customizationId === customization.id)
                            ?.optionIds.includes(option.id) || false
                        }
                        onCheckedChange={checked =>
                          handleCheckboxChange(
                            customization.id,
                            option.id,
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.name}</span>
                          {option.priceModifier !== 0 && (
                            <span className="text-sm font-medium text-[#f2330d]">
                              {option.priceModifier > 0 ? '+' : ''}
                              {formatCurrency(option.priceModifier)}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {customization.type === 'text' && (
                <Textarea
                  placeholder={`Enter your ${customization.name.toLowerCase()}...`}
                  value={
                    selectedCustomizations.find(
                      s => s.customizationId === customization.id
                    )?.textValue || ''
                  }
                  onChange={e =>
                    handleTextChange(customization.id, e.target.value)
                  }
                  className="min-h-[80px] border-[#e6dbd9] focus:border-[#f2330d] focus:ring-[#f2330d]/20"
                />
              )}
            </div>
          ))}

          {/* Special Instructions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#1c100d]">
              Special Instructions (Optional)
            </Label>
            <Textarea
              placeholder="Any special requests or dietary notes..."
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              className="min-h-[80px] border-[#e6dbd9] focus:border-[#f2330d] focus:ring-[#f2330d]/20"
            />
          </div>

          {/* Quantity and Total */}
          <div className="flex items-center justify-between rounded-lg bg-[#fcf9f8] p-4">
            <div className="flex items-center gap-3">
              <Label className="text-base font-semibold text-[#1c100d]">
                Quantity:
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-[#5c4a45]">Total</div>
              <div className="text-2xl font-bold text-[#f2330d]">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#e6dbd9] text-[#5c4a45] hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={isRequiredCustomizationMissing()}
              className="flex-1 bg-[#f2330d] text-white hover:bg-[#d12b0a] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart - {formatCurrency(totalPrice)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
