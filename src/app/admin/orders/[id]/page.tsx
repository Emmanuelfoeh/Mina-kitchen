import { Suspense } from 'react';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusUpdater } from '@/components/admin/orders/order-status-updater';
import { OrderTimeline } from '@/components/admin/orders/order-timeline';
import { OrderDetailsView } from '@/components/admin/orders/order-details-view';
import Link from 'next/link';

interface OrderDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailsProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500">View and manage order information</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Suspense fallback={<div>Loading...</div>}>
            <OrderStatusUpdater orderId={id} currentStatus="PENDING" />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Details */}
          <Suspense fallback={<div>Loading order details...</div>}>
            <OrderDetailsView orderId={id} />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading timeline...</div>}>
                <OrderTimeline orderId={id} currentStatus="PENDING" />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
