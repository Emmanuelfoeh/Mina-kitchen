'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatCurrency, generateId } from '@/utils';
import { useCartStore } from '@/stores/cart-store';
import type {
  Package,
  MenuItem,
  SelectedCustomization,
  CartItem,
} from '@/types';

interface PackageCustomizationInterfaceProps {
  package: Package;
  menuItems: MenuItem[];
  onAddToCart?: (cartItems: CartItem[]) => void;
  disabled?: boolean;
}

interface PackageItemCustomization {
  menuItemId: string;
  quantity: number;
  customizations: SelectedCustomization[];
}

interface ValidationError {
  menuItemId: string;
  customizationId: string;
  message: string;
}

export function PackageCustomizationInterface({
  package: pkg,
  menuItems,
  onAddToCart,
  disabled = false,
}: PackageCustomizationInterfaceProps) {
  // Debug logging
  console.log('PackageCustomizationInterface loaded with:', {
    packageName: pkg.name,
    packageId: pkg.id,
    includedItemsCount: pkg.includedItems.length,
    menuItemsCount: menuItems.length,
    includedItems: pkg.includedItems.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      customizations: item.includedCustomizations,
    })),
  });

  // Handle empty packages
  if (pkg.includedItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Package Configuration Incomplete
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This package doesn't have any menu items configured yet.
                  Please contact the restaurant to add items to this package, or
                  choose a different package.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary for empty package */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Package Price</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(pkg.price)}
            </span>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Items Total</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(0)}
            </span>
          </div>
        </div>

        {/* Disabled Add to Cart Button */}
        <Button
          disabled={true}
          className="w-full cursor-not-allowed bg-gray-300 text-gray-500"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Package Not Available
        </Button>
      </div>
    );
  }

  const [customizations, setCustomizations] = useState<
    PackageItemCustomization[]
  >(
    pkg.includedItems.map(item => {
      // Find the menu item to get customization details
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customizations: item.includedCustomizations.map(customization => {
          // Handle both old format (human-readable) and new format (CUID IDs)
          if (customization.includes(':')) {
            const [customizationId, optionId] = customization.split(':');

            // Check if this is a CUID format (starts with 'c' and is long)
            if (
              customizationId.startsWith('c') &&
              customizationId.length > 10
            ) {
              // New format: actual database IDs
              const customizationObj = menuItem?.customizations.find(
                c => c.id === customizationId
              );
              const option = customizationObj?.options.find(
                o => o.id === optionId
              );

              return {
                customizationId,
                customizationName: customizationObj?.name,
                optionIds: [optionId],
                optionNames: option ? [option.name] : undefined,
                textValue: undefined,
              };
            } else {
              // Old format: human-readable strings like 'pepper-level:medium'
              // Try to find matching customization and option by name patterns
              console.log(
                'Processing old format customization:',
                customization
              );

              // Find the actual customization by name similarity
              const customizationObj = menuItem?.customizations.find(c => {
                const normalizedCustomizationName = c.name
                  .toLowerCase()
                  .replace(/\s+/g, '-');
                const normalizedId = customizationId.toLowerCase();
                return (
                  normalizedCustomizationName.includes(normalizedId) ||
                  normalizedId.includes(normalizedCustomizationName)
                );
              });

              if (customizationObj) {
                // Find the option by name similarity
                const option = customizationObj.options.find(o => {
                  const normalizedOptionName = o.name
                    .toLowerCase()
                    .replace(/\s+/g, '-');
                  const normalizedId = optionId.toLowerCase();
                  return (
                    normalizedOptionName.includes(normalizedId) ||
                    normalizedId.includes(normalizedOptionName)
                  );
                });

                if (option) {
                  console.log('Found matching customization and option:', {
                    customization: customizationObj.name,
                    option: option.name,
                  });
                  return {
                    customizationId: customizationObj.id,
                    customizationName: customizationObj.name,
                    optionIds: [option.id],
                    optionNames: [option.name],
                    textValue: undefined,
                  };
                } else {
                  console.log('Found customization but no matching option:', {
                    customization: customizationObj.name,
                    searchingFor: optionId,
                    availableOptions: customizationObj.options.map(o => o.name),
                  });
                }
              } else {
                console.log(
                  'No matching customization found for:',
                  customizationId,
                  'in menu item:',
                  menuItem?.name
                );
              }

              // Fallback: create a placeholder customization that won't break the UI
              return {
                customizationId: customizationId,
                customizationName: customizationId
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase()),
                optionIds: [optionId],
                optionNames: [
                  optionId
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase()),
                ],
                textValue: undefined,
              };
            }
          }

          // Fallback for malformed customization strings
          console.log('Malformed customization string:', customization);
          return {
            customizationId: customization,
            customizationName: 'Unknown Customization',
            optionIds: [],
            optionNames: [],
            textValue: undefined,
          };
        }),
      };
    })
  );
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addItem } = useCartStore();

  // Validate all customizations
  const validateCustomizations = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    customizations.forEach(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) return;

      menuItem.customizations.forEach(customization => {
        if (!customization.required) return;

        const selected = item.customizations.find(
          c => c.customizationId === customization.id
        );

        if (!selected) {
          errors.push({
            menuItemId: item.menuItemId,
            customizationId: customization.id,
            message: `${customization.name} is required for ${menuItem.name}`,
          });
          return;
        }

        if (customization.type === 'text') {
          if (!selected.textValue?.trim()) {
            errors.push({
              menuItemId: item.menuItemId,
              customizationId: customization.id,
              message: `${customization.name} cannot be empty for ${menuItem.name}`,
            });
          }
        } else if (selected.optionIds.length === 0) {
          errors.push({
            menuItemId: item.menuItemId,
            customizationId: customization.id,
            message: `Please select an option for ${customization.name} in ${menuItem.name}`,
          });
        }

        // Check max selections for checkbox type
        if (
          customization.type === 'checkbox' &&
          customization.maxSelections &&
          selected.optionIds.length > customization.maxSelections
        ) {
          errors.push({
            menuItemId: item.menuItemId,
            customizationId: customization.id,
            message: `Maximum ${customization.maxSelections} selections allowed for ${customization.name} in ${menuItem.name}`,
          });
        }
      });
    });

    return errors;
  };

  // Update validation errors when customizations change
  useEffect(() => {
    const errors = validateCustomizations();
    setValidationErrors(errors);
  }, [customizations, menuItems]);

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCustomizations(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const updateCustomization = (
    menuItemId: string,
    customizationId: string,
    optionIds: string[],
    textValue?: string
  ) => {
    setCustomizations(prev =>
      prev.map(item => {
        if (item.menuItemId !== menuItemId) return item;

        // Find the menu item to get customization details
        const menuItem = menuItems.find(mi => mi.id === menuItemId);
        const customization = menuItem?.customizations.find(
          c => c.id === customizationId
        );
        const customizationName = customization?.name;

        // Get option names
        const optionNames = optionIds.map(optionId => {
          const option = customization?.options.find(o => o.id === optionId);
          return option?.name || optionId;
        });

        return {
          ...item,
          customizations: item.customizations.some(
            c => c.customizationId === customizationId
          )
            ? item.customizations.map(c =>
                c.customizationId === customizationId
                  ? {
                      ...c,
                      customizationName,
                      optionIds,
                      optionNames,
                      textValue,
                    }
                  : c
              )
            : [
                ...item.customizations,
                {
                  customizationId,
                  customizationName,
                  optionIds,
                  optionNames,
                  textValue,
                },
              ],
        };
      })
    );
  };

  const handleRadioChange = (
    menuItemId: string,
    customizationId: string,
    optionId: string
  ) => {
    updateCustomization(menuItemId, customizationId, [optionId]);
  };

  const handleCheckboxChange = (
    menuItemId: string,
    customizationId: string,
    optionId: string,
    checked: boolean
  ) => {
    const item = customizations.find(c => c.menuItemId === menuItemId);
    const existing = item?.customizations.find(
      c => c.customizationId === customizationId
    );
    const currentOptions = existing?.optionIds || [];

    const newOptions = checked
      ? [...currentOptions, optionId]
      : currentOptions.filter(id => id !== optionId);

    updateCustomization(menuItemId, customizationId, newOptions);
  };

  const handleTextChange = (
    menuItemId: string,
    customizationId: string,
    value: string
  ) => {
    updateCustomization(menuItemId, customizationId, [], value);
  };

  const calculateTotalPrice = () => {
    console.log('Calculating total price for customizations:', customizations);
    return customizations.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) {
        console.log('Menu item not found for ID:', item.menuItemId);
        return total;
      }

      let itemPrice = menuItem.basePrice;
      console.log(`Base price for ${menuItem.name}:`, itemPrice);

      // Add customization costs
      item.customizations.forEach(customization => {
        const customizationDef = menuItem.customizations.find(
          c => c.id === customization.customizationId
        );
        if (customizationDef) {
          customization.optionIds.forEach(optionId => {
            const option = customizationDef.options.find(
              o => o.id === optionId
            );
            if (option) {
              console.log(
                `Adding customization cost for ${option.name}:`,
                option.priceModifier
              );
              itemPrice += option.priceModifier;
            }
          });
        }
      });

      const itemTotal = itemPrice * item.quantity;
      console.log(
        `Item total for ${menuItem.name} (${item.quantity}x):`,
        itemTotal
      );
      return total + itemTotal;
    }, 0);
  };

  // Calculate the original price based on menu item base prices
  const calculateOriginalPrice = () => {
    return pkg.includedItems.reduce((total, packageItem) => {
      const menuItem = menuItems.find(mi => mi.id === packageItem.menuItemId);
      if (!menuItem) {
        console.log(
          'Menu item not found for original price calculation:',
          packageItem.menuItemId
        );
        return total;
      }
      return total + menuItem.basePrice * packageItem.quantity;
    }, 0);
  };

  const handleAddToCart = async () => {
    const errors = validateCustomizations();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItems: CartItem[] = [];

      // Create cart items for each customized package item
      customizations.forEach(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem) {
          console.error('Menu item not found:', item.menuItemId);
          return;
        }

        let unitPrice = menuItem.basePrice;

        // Calculate unit price with customizations
        item.customizations.forEach(customization => {
          const customizationDef = menuItem.customizations.find(
            c => c.id === customization.customizationId
          );
          if (customizationDef) {
            customization.optionIds.forEach(optionId => {
              const option = customizationDef.options.find(
                o => o.id === optionId
              );
              if (option) {
                unitPrice += option.priceModifier;
              }
            });
          }
        });

        // Add to cart with package reference
        for (let i = 0; i < item.quantity; i++) {
          const cartItem: CartItem = {
            id: generateId(),
            menuItemId: item.menuItemId,
            name: menuItem.name,
            image: menuItem.image,
            quantity: 1,
            selectedCustomizations: item.customizations,
            specialInstructions:
              specialInstructions || `From ${pkg.name} package`,
            unitPrice,
            totalPrice: unitPrice,
          };

          console.log('Adding cart item:', cartItem);
          cartItems.push(cartItem);
        }
      });

      console.log('Total cart items to add:', cartItems.length);

      if (onAddToCart) {
        onAddToCart(cartItems);
      } else {
        cartItems.forEach(cartItem => {
          console.log('Calling addItem with:', cartItem);
          addItem(cartItem);
        });
      }

      // Reset form after successful add
      setSpecialInstructions('');
      setValidationErrors([]);

      console.log('Package added to cart successfully');
    } catch (error) {
      console.error('Error adding package to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getCustomizationError = (
    menuItemId: string,
    customizationId: string
  ): string | null => {
    const error = validationErrors.find(
      e => e.menuItemId === menuItemId && e.customizationId === customizationId
    );
    return error?.message || null;
  };

  const isAddToCartDisabled = () => {
    return (
      disabled ||
      validationErrors.length > 0 ||
      isAddingToCart ||
      !pkg.isActive ||
      customizations.length === 0 || // Prevent adding empty packages
      totalPrice <= 0 // Prevent adding packages with no valid items
    );
  };

  const getAddToCartButtonText = () => {
    if (isAddingToCart) return 'Adding...';
    if (!pkg.isActive) return 'Package Currently Unavailable';
    if (customizations.length === 0) return 'No items in package';
    if (totalPrice <= 0) return 'Package has no valid items';
    if (validationErrors.length > 0) return 'Please complete required fields';
    return `Add Package to Cart - ${formatCurrency(totalPrice)}`;
  };

  const totalPrice = calculateTotalPrice();
  const originalPrice = calculateOriginalPrice();
  const priceDifference = totalPrice - originalPrice;

  console.log('Price calculation:', {
    totalPrice,
    originalPrice,
    priceDifference,
    packagePrice: pkg.price,
    customizationsCount: customizations.length,
    menuItemsCount: menuItems.length,
  });

  return (
    <div className="space-y-6">
      {/* Package Items Customization */}
      {customizations.map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem) return null;

        return (
          <div
            key={item.menuItemId}
            className="space-y-4 rounded-lg border p-4"
          >
            <div className="flex items-start space-x-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={menuItem.image}
                  alt={menuItem.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {menuItem.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {menuItem.description}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {menuItem.category.name}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(menuItem.basePrice)}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.menuItemId, item.quantity - 1)
                        }
                        disabled={disabled || item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.menuItemId, item.quantity + 1)
                        }
                        disabled={disabled}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Customizations for this menu item */}
                {menuItem.customizations.map(customization => {
                  const selectedCustomization = item.customizations.find(
                    c => c.customizationId === customization.id
                  );
                  const error = getCustomizationError(
                    item.menuItemId,
                    customization.id
                  );

                  return (
                    <div key={customization.id} className="mt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {customization.name}
                        </Label>
                        {customization.required && (
                          <Badge
                            variant="outline"
                            className="border-red-500 text-xs text-red-500"
                          >
                            Required
                          </Badge>
                        )}
                      </div>

                      {/* Error message */}
                      {error && (
                        <div className="mb-2 flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span>{error}</span>
                        </div>
                      )}

                      {customization.type === 'radio' && (
                        <RadioGroup
                          value={selectedCustomization?.optionIds[0] || ''}
                          onValueChange={value =>
                            handleRadioChange(
                              item.menuItemId,
                              customization.id,
                              value
                            )
                          }
                          disabled={disabled}
                        >
                          {customization.options.map(option => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option.id}
                                id={`${item.menuItemId}-${option.id}`}
                                disabled={disabled || !option.isAvailable}
                              />
                              <Label
                                htmlFor={`${item.menuItemId}-${option.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.name}</span>
                                  {option.priceModifier !== 0 && (
                                    <span className="text-sm font-medium text-green-600">
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
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${item.menuItemId}-${option.id}`}
                                checked={
                                  selectedCustomization?.optionIds.includes(
                                    option.id
                                  ) || false
                                }
                                onCheckedChange={checked =>
                                  handleCheckboxChange(
                                    item.menuItemId,
                                    customization.id,
                                    option.id,
                                    checked as boolean
                                  )
                                }
                                disabled={disabled || !option.isAvailable}
                              />
                              <Label
                                htmlFor={`${item.menuItemId}-${option.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.name}</span>
                                  {option.priceModifier !== 0 && (
                                    <span className="text-sm font-medium text-green-600">
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
                          value={selectedCustomization?.textValue || ''}
                          onChange={e =>
                            handleTextChange(
                              item.menuItemId,
                              customization.id,
                              e.target.value
                            )
                          }
                          disabled={disabled}
                          className={`min-h-[60px] text-sm ${
                            error ? 'border-red-300 focus:border-red-500' : ''
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Special Instructions */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-[#1c100d]">
          Special Instructions (Optional)
        </Label>
        <Textarea
          placeholder="Any special requests for the entire package..."
          value={specialInstructions}
          onChange={e => setSpecialInstructions(e.target.value)}
          disabled={disabled}
          className="min-h-[80px] border-[#e6dbd9] focus:border-[#f2330d] focus:ring-[#f2330d]/20"
        />
      </div>

      {/* Price Summary */}
      <div className="rounded-lg bg-[#fcf9f8] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-[#5c4a45]">Original Package Price</span>
          <span className="font-medium text-[#1c100d]">
            {formatCurrency(originalPrice)}
          </span>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-[#5c4a45]">Customized Total</span>
          <span className="font-medium text-[#1c100d]">
            {formatCurrency(totalPrice)}
          </span>
        </div>
        {priceDifference !== 0 && (
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm text-[#5c4a45]">Price Difference</span>
            <span
              className={`font-medium ${
                priceDifference > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {priceDifference > 0 ? '+' : ''}
              {formatCurrency(priceDifference)}
            </span>
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isAddToCartDisabled()}
        className={`w-full ${
          isAddToCartDisabled()
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-[#f2330d] text-white hover:bg-[#d12b0a]'
        }`}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {getAddToCartButtonText()}
      </Button>

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="mr-2 h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Please complete the following:
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
