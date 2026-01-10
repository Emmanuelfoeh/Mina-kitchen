'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useUserStore } from '@/stores/user-store';
import { X, Calendar, Clock, MapPin, Save } from 'lucide-react';
import type { Subscription } from '@/stores/subscription-store';
import type { Address } from '@/types';

interface SubscriptionEditModalProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionEditModal({
  subscription,
  isOpen,
  onClose,
}: SubscriptionEditModalProps) {
  const { updateSubscription, updateDeliverySchedule, updateDeliveryAddress } =
    useSubscriptionStore();
  const { user } = useUserStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses.find(addr => addr.id === subscription.deliveryAddress.id) ||
      null
  );
  const [deliveryDay, setDeliveryDay] = useState<string>(
    subscription.deliverySchedule.dayOfWeek?.toString() ||
      subscription.deliverySchedule.dayOfMonth?.toString() ||
      ''
  );
  const [deliveryTime, setDeliveryTime] = useState<string>(
    subscription.deliverySchedule.time
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (
      !selectedAddress ||
      (subscription.packageType !== 'daily' && !deliveryDay)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Update delivery address if changed
      if (selectedAddress.id !== subscription.deliveryAddress.id) {
        updateDeliveryAddress(subscription.id, {
          id: selectedAddress.id,
          street: selectedAddress.street,
          unit: selectedAddress.unit,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postalCode: selectedAddress.postalCode,
        });
      }

      // Update delivery schedule if changed
      const newSchedule = {
        frequency: subscription.packageType,
        dayOfWeek:
          subscription.packageType === 'weekly'
            ? parseInt(deliveryDay)
            : undefined,
        dayOfMonth:
          subscription.packageType === 'monthly'
            ? parseInt(deliveryDay)
            : undefined,
        time: deliveryTime,
      };

      if (
        newSchedule.dayOfWeek !== subscription.deliverySchedule.dayOfWeek ||
        newSchedule.dayOfMonth !== subscription.deliverySchedule.dayOfMonth ||
        newSchedule.time !== subscription.deliverySchedule.time
      ) {
        updateDeliverySchedule(subscription.id, newSchedule);

        // Calculate next delivery date based on new schedule
        const nextDelivery = new Date();
        if (
          subscription.packageType === 'weekly' &&
          newSchedule.dayOfWeek !== undefined
        ) {
          const targetDay = newSchedule.dayOfWeek;
          const currentDay = nextDelivery.getDay();
          const daysUntilTarget = (targetDay - currentDay + 7) % 7;
          nextDelivery.setDate(nextDelivery.getDate() + (daysUntilTarget || 7));
        } else if (
          subscription.packageType === 'monthly' &&
          newSchedule.dayOfMonth
        ) {
          nextDelivery.setDate(newSchedule.dayOfMonth);
          if (nextDelivery < new Date()) {
            nextDelivery.setMonth(nextDelivery.getMonth() + 1);
          }
        }

        updateSubscription(subscription.id, { nextDelivery });
      }

      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getDayOptions = () => {
    if (subscription.packageType === 'daily') {
      return [];
    } else if (subscription.packageType === 'weekly') {
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

  const isFormValid =
    selectedAddress && (subscription.packageType === 'daily' || deliveryDay);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Subscription
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Info */}
          <div className="rounded-lg bg-orange-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">
              {subscription.packageName}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {subscription.packageType.charAt(0).toUpperCase() +
                  subscription.packageType.slice(1)}{' '}
                Package
              </span>
              <span className="font-bold text-orange-600">
                ${subscription.price.toFixed(2)} per{' '}
                {subscription.packageType === 'daily'
                  ? 'day'
                  : subscription.packageType === 'weekly'
                    ? 'week'
                    : 'month'}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-5 w-5" />
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
                No addresses available. Please add an address in your profile.
              </div>
            )}
          </div>

          {/* Delivery Schedule */}
          {subscription.packageType !== 'daily' && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="h-5 w-5" />
                Delivery{' '}
                {subscription.packageType === 'weekly' ? 'Day' : 'Date'}
              </Label>
              <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${subscription.packageType === 'weekly' ? 'day of week' : 'day of month'}`}
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
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-5 w-5" />
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

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
