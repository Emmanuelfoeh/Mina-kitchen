'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AddToCartSection } from '@/components/ui/add-to-cart-section';
import { TouchArea } from '@/components/ui/touch-target';
import { Flame, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils';
import {
  announceCustomizationChange,
  announcePriceUpdate,
  announceValidationError,
  getKeyboardInstructions,
} from '@/lib/screen-reader';
import { useCustomizationTracking } from '@/hooks/use-analytics';
import type {
  MenuItem,
  SelectedCustomization,
  CartItem,
  Customization,
} from '@/types';

interface CustomizationInterfaceProps {
  item: MenuItem;
  onAddToCart?: (cartItem: CartItem) => void;
  disabled?: boolean;
}

interface ValidationError {
  customizationId: string;
  message: string;
}

export function CustomizationInterface({
  item,
  onAddToCart,
  disabled = false,
}: CustomizationInterfaceProps) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    SelectedCustomization[]
  >([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Initialize analytics tracking
  const { trackCustomization } = useCustomizationTracking(item);

  // Calculate total price when customizations change
  const calculateCustomizationPrice = (): number => {
    let customizationPrice = 0;

    selectedCustomizations.forEach(selected => {
      const customization = item.customizations.find(
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

    return customizationPrice;
  };

  // Validate customizations
  const validateCustomizations = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    item.customizations.forEach(customization => {
      if (!customization.required) return;

      const selected = selectedCustomizations.find(
        s => s.customizationId === customization.id
      );

      if (!selected) {
        errors.push({
          customizationId: customization.id,
          message: `${customization.name} is required`,
        });
        return;
      }

      if (customization.type === 'text') {
        if (!selected.textValue?.trim()) {
          errors.push({
            customizationId: customization.id,
            message: `${customization.name} cannot be empty`,
          });
        }
      } else if (selected.optionIds.length === 0) {
        errors.push({
          customizationId: customization.id,
          message: `Please select an option for ${customization.name}`,
        });
      }

      // Check max selections for checkbox type
      if (
        customization.type === 'checkbox' &&
        customization.maxSelections &&
        selected.optionIds.length > customization.maxSelections
      ) {
        errors.push({
          customizationId: customization.id,
          message: `Maximum ${customization.maxSelections} selections allowed for ${customization.name}`,
        });
      }
    });

    return errors;
  };

  // Update validation errors when customizations change
  useEffect(() => {
    const errors = validateCustomizations();
    const previousErrorCount = validationErrors.length;
    setValidationErrors(errors);

    // Announce validation errors to screen readers
    if (errors.length > 0 && errors.length !== previousErrorCount) {
      errors.forEach(error => {
        announceValidationError(error.customizationId, error.message);
      });
    }

    // Announce price updates
    const newPrice = item.basePrice + calculateCustomizationPrice();
    announcePriceUpdate(newPrice, 'with customizations');
  }, [selectedCustomizations, item.customizations]);

  const handleCustomizationChange = (
    customizationId: string,
    optionIds: string[],
    textValue?: string
  ) => {
    setSelectedCustomizations(prev => {
      const existing = prev.find(c => c.customizationId === customizationId);

      // Find the customization to get its name
      const customization = item.customizations.find(
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
    const customization = item.customizations.find(
      c => c.id === customizationId
    );
    const option = customization?.options.find(o => o.id === optionId);

    handleCustomizationChange(customizationId, [optionId]);

    // Track analytics for customization selection
    if (customization && option) {
      trackCustomization(
        customization.name,
        'radio',
        option.name,
        option.priceModifier,
        selectedCustomizations.length + 1
      );
    }

    // Announce the change to screen readers
    if (customization && option) {
      announceCustomizationChange(
        customization.name,
        option.name,
        option.priceModifier
      );
    }
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

    // Track analytics for customization selection
    const customization = item.customizations.find(
      c => c.id === customizationId
    );
    const option = customization?.options.find(o => o.id === optionId);

    if (customization && option) {
      trackCustomization(
        customization.name,
        'checkbox',
        `${option.name} ${checked ? 'added' : 'removed'}`,
        checked ? option.priceModifier : -option.priceModifier,
        selectedCustomizations.length
      );
    }

    // Announce the change to screen readers
    if (customization && option) {
      const action = checked ? 'added' : 'removed';
      announceCustomizationChange(
        customization.name,
        `${option.name} ${action}`,
        checked ? option.priceModifier : -option.priceModifier
      );
    }
  };

  const handleTextChange = (customizationId: string, value: string) => {
    handleCustomizationChange(customizationId, [], value);

    // Track analytics for text customization
    const customization = item.customizations.find(
      c => c.id === customizationId
    );

    if (customization && value.trim()) {
      trackCustomization(
        customization.name,
        'text',
        'text_entered',
        0,
        selectedCustomizations.length
      );
    }
  };

  // Check if all required customizations are valid
  const areCustomizationsValid = () => {
    return validateCustomizations().length === 0;
  };

  const getPepperLevelIcon = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('hot') || lowerLevel.includes('spicy')) {
      return <Flame className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getCustomizationError = (customizationId: string): string | null => {
    const error = validationErrors.find(
      e => e.customizationId === customizationId
    );
    return error?.message || null;
  };

  const handleAddToCartSuccess = () => {
    // Reset form after successful add
    setSelectedCustomizations([]);
    setSpecialInstructions('');
    setValidationErrors([]);
  };

  const handleAddToCartError = (error: string) => {
    // Handle add to cart errors
    console.error('Error adding item to cart:', error);
  };

  return (
    <div
      className="space-y-4 sm:space-y-6"
      role="form"
      aria-label="Customize your order"
    >
      {/* Customizations */}
      {item.customizations.map(customization => {
        const error = getCustomizationError(customization.id);

        return (
          <fieldset key={customization.id} className="space-y-3">
            <legend className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-base font-semibold text-[#1c100d] sm:text-lg">
                {customization.name}
              </span>
              <div className="flex gap-2">
                {customization.required && (
                  <Badge
                    variant="outline"
                    className="border-[#f2330d] text-xs text-[#f2330d]"
                    aria-label="Required selection"
                  >
                    Required
                  </Badge>
                )}
                {customization.maxSelections &&
                  customization.type === 'checkbox' && (
                    <Badge
                      variant="outline"
                      className="text-xs text-gray-600"
                      aria-label={`Maximum ${customization.maxSelections} selections allowed`}
                    >
                      Max {customization.maxSelections}
                    </Badge>
                  )}
              </div>
            </legend>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700"
                role="alert"
                aria-live="polite"
                id={`error-${customization.id}`}
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

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
                disabled={disabled}
                className="space-y-2 sm:space-y-3"
                aria-describedby={
                  error ? `error-${customization.id}` : undefined
                }
                aria-required={customization.required}
              >
                {customization.options.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors sm:p-4 ${
                      error
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    } ${!option.isAvailable ? 'opacity-50' : ''}`}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={disabled || !option.isAvailable}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer text-sm sm:text-base"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <div className="flex items-center gap-2">
                          <span>{option.name}</span>
                          {getPepperLevelIcon(option.name) && (
                            <span aria-label="Spicy option">
                              {getPepperLevelIcon(option.name)}
                            </span>
                          )}
                          {!option.isAvailable && (
                            <span
                              className="text-xs text-gray-500"
                              aria-label="Currently unavailable"
                            >
                              (Unavailable)
                            </span>
                          )}
                        </div>
                        {option.priceModifier !== 0 && (
                          <span className="text-sm font-medium text-[#f2330d] sm:text-base">
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
              <div
                className="space-y-2 sm:space-y-3"
                role="group"
                aria-describedby={
                  error ? `error-${customization.id}` : undefined
                }
                aria-required={customization.required}
              >
                {customization.options.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors sm:p-4 ${
                      error
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    } ${!option.isAvailable ? 'opacity-50' : ''}`}
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
                      disabled={disabled || !option.isAvailable}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer text-sm sm:text-base"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <div className="flex items-center gap-2">
                          <span>{option.name}</span>
                          {!option.isAvailable && (
                            <span className="text-xs text-gray-500">
                              (Unavailable)
                            </span>
                          )}
                        </div>
                        {option.priceModifier !== 0 && (
                          <span className="text-sm font-medium text-[#f2330d] sm:text-base">
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
                disabled={disabled}
                className={`min-h-[80px] border-[#e6dbd9] focus:border-[#f2330d] focus:ring-[#f2330d]/20 ${
                  error ? 'border-red-300 focus:border-red-500' : ''
                }`}
                aria-describedby={
                  error ? `error-${customization.id}` : undefined
                }
                aria-required={customization.required}
              />
            )}
          </fieldset>
        );
      })}

      {/* Special Instructions */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-[#1c100d] sm:text-lg">
          Special Instructions (Optional)
        </Label>
        <Textarea
          placeholder="Any special requests or dietary notes..."
          value={specialInstructions}
          onChange={e => setSpecialInstructions(e.target.value)}
          disabled={disabled}
          className="min-h-[80px] border-[#e6dbd9] text-sm focus:border-[#f2330d] focus:ring-[#f2330d]/20 sm:min-h-[100px] sm:text-base"
        />
      </div>

      {/* Add to Cart Section */}
      <AddToCartSection
        item={item}
        selectedCustomizations={selectedCustomizations}
        specialInstructions={specialInstructions}
        disabled={disabled || !areCustomizationsValid()}
        onAddToCart={onAddToCart}
        onSuccess={handleAddToCartSuccess}
        onError={handleAddToCartError}
      />

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
