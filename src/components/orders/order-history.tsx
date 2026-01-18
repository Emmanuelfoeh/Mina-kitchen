'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Package, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/types';

export function OrderHistory() {
  const { user, isAuthenticated } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/orders?customerId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return status
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">Please log in to view your orders.</p>
        <Link href="/auth/login?redirect=/orders">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No orders yet
        </h3>
        <p className="mb-6 text-gray-600">
          When you place your first order, it will appear here.
        </p>
        <Link href="/menu">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {orders.map(order => (
        <Card key={order.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Order {order.orderNumber}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Items Summary */}
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Items</h4>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x{' '}
                        {item.menuItem?.name || `Menu Item #${item.menuItemId}`}
                      </span>
                      <span className="font-medium">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{order.items.length - 3} more item
                      {order.items.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Order Details */}
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {order.deliveryType === 'delivery'
                        ? 'Delivery'
                        : 'Pickup'}
                    </span>
                  </div>

                  {order.scheduledFor && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDate(order.scheduledFor)}
                      </span>
                    </div>
                  )}

                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {order.deliveryAddress.street},{' '}
                        {order.deliveryAddress.city}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="text-lg font-bold">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Payment</span>
                    <span className="capitalize">
                      {order.paymentStatus.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(order.updatedAt)}
                </div>
                <Link href={`/order-confirmation?orderId=${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
