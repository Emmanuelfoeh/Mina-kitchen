'use client';

import { useState } from 'react';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { SubscriptionCard } from './subscription-card';
import { SubscriptionEditModal } from './subscription-edit-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Subscription } from '@/stores/subscription-store';

export function SubscriptionManager() {
  const { subscriptions, getActiveSubscriptions } = useSubscriptionStore();
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activeSubscriptions = getActiveSubscriptions();
  const pausedSubscriptions = subscriptions.filter(
    sub => sub.status === 'paused'
  );
  const cancelledSubscriptions = subscriptions.filter(
    sub => sub.status === 'cancelled'
  );

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSubscription(null);
  };

  if (subscriptions.length === 0) {
    return (
      <div className="py-12 text-center">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No Subscriptions Yet
            </h3>
            <p className="mb-6 text-gray-600">
              Start your first meal package subscription to enjoy regular
              deliveries of authentic African cuisine.
            </p>
            <Link href="/packages">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600">
                <Plus className="mr-2 h-4 w-4" />
                Browse Packages
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Active Subscriptions
              </h2>
              <Badge className="bg-green-100 text-green-800">
                {activeSubscriptions.length} active
              </Badge>
            </div>
            <Link href="/packages">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Subscription
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={() => handleEditSubscription(subscription)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paused Subscriptions */}
      {pausedSubscriptions.length > 0 && (
        <div>
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Paused Subscriptions
            </h2>
            <Badge className="bg-yellow-100 text-yellow-800">
              {pausedSubscriptions.length} paused
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pausedSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={() => handleEditSubscription(subscription)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Subscriptions */}
      {cancelledSubscriptions.length > 0 && (
        <div>
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Cancelled Subscriptions
            </h2>
            <Badge className="bg-gray-100 text-gray-800">
              {cancelledSubscriptions.length} cancelled
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cancelledSubscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={() => handleEditSubscription(subscription)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deliveries Summary */}
      {activeSubscriptions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Upcoming Deliveries
              </h3>
            </div>
            <div className="space-y-3">
              {activeSubscriptions
                .sort(
                  (a, b) =>
                    new Date(a.nextDelivery).getTime() -
                    new Date(b.nextDelivery).getTime()
                )
                .slice(0, 3)
                .map(subscription => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between border-b border-blue-200 py-2 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-blue-900">
                        {subscription.packageName}
                      </div>
                      <div className="text-sm text-blue-700">
                        {subscription.deliveryAddress.street},{' '}
                        {subscription.deliveryAddress.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-900">
                        {new Date(
                          subscription.nextDelivery
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-blue-700">
                        {subscription.deliverySchedule.time}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Subscription Modal */}
      {selectedSubscription && (
        <SubscriptionEditModal
          subscription={selectedSubscription}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
}
