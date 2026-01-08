'use client';

import { useState } from 'react';
import { useUserStore } from '@/stores/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MapPin, Plus } from 'lucide-react';
import type { Address } from '@/types';

interface AddressFormProps {
  deliveryType: 'delivery' | 'pickup';
  selectedAddress?: Address;
  onAddressSelect: (address: Address) => void;
  onNext: () => void;
  onBack: () => void;
}

interface NewAddressForm {
  street: string;
  unit: string;
  city: string;
  province: string;
  postalCode: string;
}

const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'YT', label: 'Yukon' },
];

export function AddressForm({
  deliveryType,
  selectedAddress,
  onAddressSelect,
  onNext,
  onBack,
}: AddressFormProps) {
  const { user, addAddress, isLoading } = useUserStore();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>({
    street: '',
    unit: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [errors, setErrors] = useState<Partial<NewAddressForm>>({});

  // Skip address step for pickup
  if (deliveryType === 'pickup') {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Pickup Selected
          </h3>
          <p className="text-gray-600">
            No delivery address needed for pickup orders.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<NewAddressForm> = {};

    if (!newAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!newAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!newAddress.province) {
      newErrors.province = 'Province is required';
    }
    if (!newAddress.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (
      !/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(newAddress.postalCode)
    ) {
      newErrors.postalCode = 'Please enter a valid Canadian postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      const addressToSave = {
        ...newAddress,
        isDefault: user?.addresses.length === 0, // Make first address default
      };

      await addAddress(addressToSave);
      setShowNewAddressForm(false);
      setNewAddress({
        street: '',
        unit: '',
        city: '',
        province: '',
        postalCode: '',
      });
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const canContinue =
    selectedAddress !== undefined || deliveryType !== 'delivery';

  return (
    <div className="space-y-6">
      {/* Existing Addresses */}
      {user?.addresses && user.addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Select Delivery Address</h3>
          <div className="grid gap-3">
            {user.addresses.map(address => (
              <Card
                key={address.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAddress?.id === address.id
                    ? 'ring-primary border-primary bg-primary/5 ring-2'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => onAddressSelect(address)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {address.isDefault && (
                          <span className="bg-primary rounded px-2 py-0.5 text-xs text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium">
                        {address.street}
                        {address.unit && `, Unit ${address.unit}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                    </div>
                    {selectedAddress?.id === address.id && (
                      <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Address */}
      <div>
        {!showNewAddressForm ? (
          <Button
            variant="outline"
            onClick={() => setShowNewAddressForm(true)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add New Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={newAddress.street}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    placeholder="123 Main Street"
                    className={errors.street ? 'border-red-500' : ''}
                  />
                  {errors.street && (
                    <p className="mt-1 text-xs text-red-500">{errors.street}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="unit">Unit/Apt</Label>
                  <Input
                    id="unit"
                    value={newAddress.unit}
                    onChange={e =>
                      setNewAddress(prev => ({ ...prev, unit: e.target.value }))
                    }
                    placeholder="Apt 4B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={newAddress.city}
                    onChange={e =>
                      setNewAddress(prev => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Toronto"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Select
                    value={newAddress.province}
                    onValueChange={value =>
                      setNewAddress(prev => ({ ...prev, province: value }))
                    }
                  >
                    <SelectTrigger
                      className={errors.province ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANADIAN_PROVINCES.map(province => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.province}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={newAddress.postalCode}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        postalCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="M5V 3A8"
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewAddressForm(false);
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAddress} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
