import { Suspense } from 'react';
import { OrderConfirmation } from '@/components/checkout/order-confirmation';
import { OrderConfirmationSkeleton } from '@/components/checkout/order-confirmation-skeleton';

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Suspense fallback={<OrderConfirmationSkeleton />}>
            <OrderConfirmation />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
