'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStore } from '@/stores/subscription-store';
import {
  Calendar,
  MapPin,
  Clock,
  Edit,
  Pause,
  Play,
  X,
  Package,
  AlertTriangle,
} from 'lucide-react';
import type { Subscription } from '@/stores/subscription-store';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: () => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
}: SubscriptionCardProps) {
  const { pauseSubscription, resumeSubscription, cancelSubscription } =
    useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyLabel = (type: Subscription['packageType']) => {
    switch (type) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Unknown';
    }
  };

  const formatNextDelivery = (date: Date) => {
    const now = new Date();
    const deliveryDate = new Date(date);
    const diffTime = deliveryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 0) {
      return `In ${diffDays} days`;
    } else {
      return 'Overdue';
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      pauseSubscription(subscription.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      resumeSubscription(subscription.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this subscription? This action cannot be undone.'
      )
    ) {
      setIsLoading(true);
      try {
        cancelSubscription(subscription.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-gray-900 transition-colors group-hover:text-orange-600">
              {subscription.packageName}
            </h3>
          </div>
          <Badge
            className={`${getStatusColor(subscription.status)} font-semibold`}
          >
            {subscription.status.charAt(0).toUpperCase() +
              subscription.status.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {getFrequencyLabel(subscription.packageType)}
          </div>
          <div className="text-lg font-bold text-orange-600">
            ${subscription.price.toFixed(2)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Next Delivery */}
        {subscription.status === 'active' && (
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Next Delivery
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {formatNextDelivery(subscription.nextDelivery)} -{' '}
              {subscription.deliverySchedule.time}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Delivery Address
            </span>
          </div>
          <div className="ml-6 text-sm text-gray-600">
            {subscription.deliveryAddress.street}
            {subscription.deliveryAddress.unit &&
              ` Unit ${subscription.deliveryAddress.unit}`}
            <br />
            {subscription.deliveryAddress.city},{' '}
            {subscription.deliveryAddress.province}{' '}
            {subscription.deliveryAddress.postalCode}
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Schedule</span>
          </div>
          <div className="ml-6 text-sm text-gray-600">
            {subscription.packageType === 'weekly' &&
              subscription.deliverySchedule.dayOfWeek !== undefined && (
                <>
                  Every{' '}
                  {
                    [
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ][subscription.deliverySchedule.dayOfWeek]
                  }{' '}
                  at {subscription.deliverySchedule.time}
                </>
              )}
            {subscription.packageType === 'monthly' &&
              subscription.deliverySchedule.dayOfMonth && (
                <>
                  {subscription.deliverySchedule.dayOfMonth}
                  {subscription.deliverySchedule.dayOfMonth === 1
                    ? 'st'
                    : subscription.deliverySchedule.dayOfMonth === 2
                      ? 'nd'
                      : subscription.deliverySchedule.dayOfMonth === 3
                        ? 'rd'
                        : 'th'}{' '}
                  of each month at {subscription.deliverySchedule.time}
                </>
              )}
            {subscription.packageType === 'daily' && (
              <>Daily at {subscription.deliverySchedule.time}</>
            )}
          </div>
        </div>

        {/* Status-specific information */}
        {subscription.status === 'paused' && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Subscription Paused
              </span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Your subscription is temporarily paused. Resume anytime to
              continue deliveries.
            </p>
          </div>
        )}

        {subscription.status === 'cancelled' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">
                Subscription Cancelled
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              This subscription was cancelled on{' '}
              {new Date(subscription.updatedAt).toLocaleDateString()}.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="space-y-2 pt-4">
        {/* Action Buttons */}
        <div className="flex w-full gap-2">
          {subscription.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex-1"
                disabled={isLoading}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                className="flex-1"
                disabled={isLoading}
              >
                <Pause className="mr-1 h-4 w-4" />
                Pause
              </Button>
            </>
          )}

          {subscription.status === 'paused' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex-1"
                disabled={isLoading}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={handleResume}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                disabled={isLoading}
              >
                <Play className="mr-1 h-4 w-4" />
                Resume
              </Button>
            </>
          )}

          {subscription.status === 'cancelled' && (
            <div className="w-full text-center text-sm text-gray-500">
              No actions available
            </div>
          )}
        </div>

        {/* Cancel Button (for active and paused subscriptions) */}
        {(subscription.status === 'active' ||
          subscription.status === 'paused') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isLoading}
          >
            <AlertTriangle className="mr-1 h-4 w-4" />
            Cancel Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
