import { Suspense } from 'react';
import { SubscriptionManager } from '@/components/subscriptions/subscription-manager';
import { SubscriptionSkeleton } from '@/components/subscriptions/subscription-skeleton';

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            My Subscriptions
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Manage your meal package subscriptions, modify delivery schedules,
            and track upcoming deliveries.
          </p>
        </div>

        {/* Subscription Manager */}
        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionManager />
        </Suspense>
      </div>
    </div>
  );
}
