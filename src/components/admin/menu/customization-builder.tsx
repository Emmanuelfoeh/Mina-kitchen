'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  GripVertical,
  Edit3,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

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

interface CustomizationBuilderProps {
  customizations: Customization[];
  onChange: (customizations: Customization[]) => void;
  disabled?: boolean;
}

export function CustomizationBuilder({
  customizations,
  onChange,
  disabled = false,
}: CustomizationBuilderProps) {
  const [editingCustomization, setEditingCustomization] = useState<
    string | null
  >(null);
  const [editingOption, setEditingOption] = useState<string | null>(null);

  const generateId = () =>
    `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addCustomization = () => {
    const newCustomization: Customization = {
      id: generateId(),
      name: 'New Customization',
      type: 'radio',
      required: false,
      options: [],
    };

    onChange([...customizations, newCustomization]);
    setEditingCustomization(newCustomization.id);
  };

  const updateCustomization = (id: string, updates: Partial<Customization>) => {
    onChange(customizations.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomization = (id: string) => {
    onChange(customizations.filter(c => c.id !== id));
  };

  const addOption = (customizationId: string) => {
    const newOption: CustomizationOption = {
      id: generateId(),
      name: 'New Option',
      priceModifier: 0,
      isAvailable: true,
    };

    updateCustomization(customizationId, {
      options: [
        ...(customizations.find(c => c.id === customizationId)?.options || []),
        newOption,
      ],
    });
    setEditingOption(newOption.id);
  };

  const updateOption = (
    customizationId: string,
    optionId: string,
    updates: Partial<CustomizationOption>
  ) => {
    const customization = customizations.find(c => c.id === customizationId);
    if (!customization) return;

    const updatedOptions = customization.options.map(o =>
      o.id === optionId ? { ...o, ...updates } : o
    );

    updateCustomization(customizationId, { options: updatedOptions });
  };

  const deleteOption = (customizationId: string, optionId: string) => {
    const customization = customizations.find(c => c.id === customizationId);
    if (!customization) return;

    const updatedOptions = customization.options.filter(o => o.id !== optionId);
    updateCustomization(customizationId, { options: updatedOptions });
  };

  const moveCustomization = (fromIndex: number, toIndex: number) => {
    const newCustomizations = [...customizations];
    const [moved] = newCustomizations.splice(fromIndex, 1);
    newCustomizations.splice(toIndex, 0, moved);
    onChange(newCustomizations);
  };

  const validateCustomization = (customization: Customization): string[] => {
    const errors: string[] = [];

    if (!customization.name.trim()) {
      errors.push('Customization name is required');
    }

    if (customization.type !== 'text' && customization.options.length === 0) {
      errors.push(
        'At least one option is required for radio and checkbox types'
      );
    }

    if (
      customization.type === 'checkbox' &&
      customization.maxSelections &&
      customization.maxSelections > customization.options.length
    ) {
      errors.push('Max selections cannot exceed number of options');
    }

    return errors;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Menu Customizations</Label>
          <p className="mt-1 text-sm text-gray-500">
            Add customization options that customers can select when ordering
            this item.
          </p>
        </div>
        <Button
          type="button"
          onClick={addCustomization}
          disabled={disabled}
          size="sm"
          className="bg-[#f2330d] hover:bg-[#d12b0a]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customization
        </Button>
      </div>

      {customizations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <Edit3 className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 font-medium text-gray-900">
              No customizations yet
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Add customization options like size, spice level, or add-ons to
              let customers personalize their order.
            </p>
            <Button
              type="button"
              onClick={addCustomization}
              disabled={disabled}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Customization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {customizations.map((customization, index) => {
            const errors = validateCustomization(customization);
            const isEditing = editingCustomization === customization.id;

            return (
              <Card
                key={customization.id}
                className={errors.length > 0 ? 'border-red-200' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <Label className="text-sm">Name</Label>
                              <Input
                                value={customization.name}
                                onChange={e =>
                                  updateCustomization(customization.id, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="e.g., Size, Spice Level"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Type</Label>
                              <Select
                                value={customization.type}
                                onValueChange={(
                                  value: 'radio' | 'checkbox' | 'text'
                                ) =>
                                  updateCustomization(customization.id, {
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="radio">
                                    Single Choice (Radio)
                                  </SelectItem>
                                  <SelectItem value="checkbox">
                                    Multiple Choice (Checkbox)
                                  </SelectItem>
                                  <SelectItem value="text">
                                    Text Input
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`required-${customization.id}`}
                                checked={customization.required}
                                onCheckedChange={checked =>
                                  updateCustomization(customization.id, {
                                    required: checked as boolean,
                                  })
                                }
                              />
                              <Label
                                htmlFor={`required-${customization.id}`}
                                className="text-sm"
                              >
                                Required
                              </Label>
                            </div>

                            {customization.type === 'checkbox' && (
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">
                                  Max selections:
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={customization.maxSelections || ''}
                                  onChange={e =>
                                    updateCustomization(customization.id, {
                                      maxSelections: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    })
                                  }
                                  className="w-20"
                                  placeholder="∞"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {customization.name}
                              <Badge
                                variant={
                                  customization.required
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {customization.required
                                  ? 'Required'
                                  : 'Optional'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {customization.type === 'radio'
                                  ? 'Single Choice'
                                  : customization.type === 'checkbox'
                                    ? 'Multiple Choice'
                                    : 'Text Input'}
                              </Badge>
                              {customization.type === 'checkbox' &&
                                customization.maxSelections && (
                                  <Badge variant="outline" className="text-xs">
                                    Max {customization.maxSelections}
                                  </Badge>
                                )}
                            </CardTitle>
                            {errors.length > 0 && (
                              <div className="mt-1 flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{errors[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setEditingCustomization(null)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCustomization(null);
                              // Reset to original state if needed
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingCustomization(customization.id)
                            }
                            disabled={disabled}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              deleteCustomization(customization.id)
                            }
                            disabled={disabled}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {customization.type !== 'text' && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Options</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addOption(customization.id)}
                          disabled={disabled}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>

                      {customization.options.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-200 py-4 text-center text-sm text-gray-500">
                          No options added yet. Click "Add Option" to get
                          started.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customization.options.map(option => {
                            const isEditingOption = editingOption === option.id;

                            return (
                              <div
                                key={option.id}
                                className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3"
                              >
                                {isEditingOption ? (
                                  <>
                                    <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-3">
                                      <Input
                                        value={option.name}
                                        onChange={e =>
                                          updateOption(
                                            customization.id,
                                            option.id,
                                            { name: e.target.value }
                                          )
                                        }
                                        placeholder="Option name"
                                      />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={option.priceModifier}
                                        onChange={e =>
                                          updateOption(
                                            customization.id,
                                            option.id,
                                            {
                                              priceModifier:
                                                parseFloat(e.target.value) || 0,
                                            }
                                          )
                                        }
                                        placeholder="Price modifier"
                                      />
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`available-${option.id}`}
                                          checked={option.isAvailable}
                                          onCheckedChange={checked =>
                                            updateOption(
                                              customization.id,
                                              option.id,
                                              {
                                                isAvailable: checked as boolean,
                                              }
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`available-${option.id}`}
                                          className="text-sm"
                                        >
                                          Available
                                        </Label>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setEditingOption(null)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingOption(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                          {option.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {option.priceModifier !== 0 && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {option.priceModifier > 0
                                                ? '+'
                                                : ''}
                                              ${option.priceModifier.toFixed(2)}
                                            </Badge>
                                          )}
                                          <Badge
                                            variant={
                                              option.isAvailable
                                                ? 'default'
                                                : 'secondary'
                                            }
                                            className="text-xs"
                                          >
                                            {option.isAvailable
                                              ? 'Available'
                                              : 'Unavailable'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setEditingOption(option.id)
                                        }
                                        disabled={disabled}
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          deleteOption(
                                            customization.id,
                                            option.id
                                          )
                                        }
                                        disabled={disabled}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
