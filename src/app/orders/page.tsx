import { Suspense } from 'react';
import { OrderHistory } from '@/components/orders/order-history';
import { OrderHistorySkeleton } from '@/components/orders/order-history-skeleton';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Orders</h1>
          <Suspense fallback={<OrderHistorySkeleton />}>
            <OrderHistory />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
