'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/user-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Calendar, Clock, MapPin, Repeat } from 'lucide-react';
import type { Package, Address } from '@/types';

interface SubscriptionSetupProps {
  package: Package;
  customizations: Array<{
    menuItemId: string;
    selectedCustomizations: Array<{
      customizationId: string;
      optionIds: string[];
      textValue?: string;
    }>;
  }>;
  onSubscribe: () => void;
}

export function SubscriptionSetup({
  package: pkg,
  customizations,
  onSubscribe,
}: SubscriptionSetupProps) {
  const { user } = useUserStore();
  const { addSubscription } = useSubscriptionStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses.find(addr => addr.isDefault) || user?.addresses[0] || null
  );
  const [deliveryDay, setDeliveryDay] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('12:00');
  const [startDate, setStartDate] = useState<string>('');

  const handleSubscribe = () => {
    if (!selectedAddress || !deliveryDay || !startDate) {
      return;
    }

    const nextDelivery = new Date(startDate);

    // Calculate next delivery based on package type
    if (pkg.type === 'weekly') {
      const targetDay = parseInt(deliveryDay);
      const currentDay = nextDelivery.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      nextDelivery.setDate(nextDelivery.getDate() + daysUntilTarget);
    } else if (pkg.type === 'monthly') {
      const targetDay = parseInt(deliveryDay);
      nextDelivery.setDate(targetDay);
      if (nextDelivery < new Date()) {
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
      }
    }

    addSubscription({
      packageId: pkg.id,
      packageName: pkg.name,
      packageType: pkg.type,
      price: pkg.price,
      status: 'active',
      startDate: new Date(startDate),
      nextDelivery,
      deliveryAddress: {
        id: selectedAddress.id,
        street: selectedAddress.street,
        unit: selectedAddress.unit,
        city: selectedAddress.city,
        province: selectedAddress.province,
        postalCode: selectedAddress.postalCode,
      },
      deliverySchedule: {
        frequency: pkg.type,
        dayOfWeek: pkg.type === 'weekly' ? parseInt(deliveryDay) : undefined,
        dayOfMonth: pkg.type === 'monthly' ? parseInt(deliveryDay) : undefined,
        time: deliveryTime,
      },
      customizations,
    });

    onSubscribe();
  };

  const getDayOptions = () => {
    if (pkg.type === 'daily') {
      return [];
    } else if (pkg.type === 'weekly') {
      return [
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
        { value: '0', label: 'Sunday' },
      ];
    } else {
      // Monthly - days of month
      return Array.from({ length: 28 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
      }));
    }
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const getFrequencyLabel = () => {
    switch (pkg.type) {
      case 'daily':
        return 'Daily delivery';
      case 'weekly':
        return 'Weekly delivery';
      case 'monthly':
        return 'Monthly delivery';
      default:
        return 'Delivery';
    }
  };

  const isFormValid =
    selectedAddress && (pkg.type === 'daily' || deliveryDay) && startDate;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-orange-600" />
            Subscription Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Package Summary */}
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
              <Badge className="bg-orange-100 text-orange-800">
                {getFrequencyLabel()}
              </Badge>
            </div>
            <p className="mb-2 text-sm text-gray-600">{pkg.description}</p>
            <div className="text-lg font-bold text-orange-600">
              ${pkg.price.toFixed(2)} per{' '}
              {pkg.type === 'daily'
                ? 'day'
                : pkg.type === 'weekly'
                  ? 'week'
                  : 'month'}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </Label>
            {user?.addresses && user.addresses.length > 0 ? (
              <Select
                value={selectedAddress?.id || ''}
                onValueChange={value => {
                  const address = user.addresses.find(
                    addr => addr.id === value
                  );
                  setSelectedAddress(address || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery address" />
                </SelectTrigger>
                <SelectContent>
                  {user.addresses.map(address => (
                    <SelectItem key={address.id} value={address.id}>
                      <div className="flex flex-col">
                        <span>
                          {address.street}{' '}
                          {address.unit && `Unit ${address.unit}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {address.city}, {address.province}{' '}
                          {address.postalCode}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                Please add a delivery address in your profile to continue.
              </div>
            )}
          </div>

          {/* Delivery Schedule */}
          {pkg.type !== 'daily' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Delivery {pkg.type === 'weekly' ? 'Day' : 'Date'}
              </Label>
              <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${pkg.type === 'weekly' ? 'day of week' : 'day of month'}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {getDayOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Delivery Time
            </Label>
            <Select value={deliveryTime} onValueChange={setDeliveryTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="11:00">11:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="13:00">1:00 PM</SelectItem>
                <SelectItem value="14:00">2:00 PM</SelectItem>
                <SelectItem value="15:00">3:00 PM</SelectItem>
                <SelectItem value="16:00">4:00 PM</SelectItem>
                <SelectItem value="17:00">5:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={!isFormValid}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white transition-all duration-200 hover:from-orange-600 hover:to-red-600"
          >
            Start Subscription - ${pkg.price.toFixed(2)} per{' '}
            {pkg.type === 'daily'
              ? 'day'
              : pkg.type === 'weekly'
                ? 'week'
                : 'month'}
          </Button>

          {/* Subscription Benefits */}
          <div className="rounded-lg bg-green-50 p-4">
            <h5 className="mb-2 font-semibold text-green-800">
              Subscription Benefits:
            </h5>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Automatic delivery on your schedule</li>
              <li>• Easy modification and cancellation</li>
              <li>• Priority customer support</li>
              <li>• Consistent pricing protection</li>
              {pkg.type === 'monthly' && <li>• Free delivery included</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
