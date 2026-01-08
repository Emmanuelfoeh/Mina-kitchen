import { Suspense } from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';
import { CheckoutSkeleton } from '@/components/checkout/checkout-skeleton';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>
          <Suspense fallback={<CheckoutSkeleton />}>
            <CheckoutFlow />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
