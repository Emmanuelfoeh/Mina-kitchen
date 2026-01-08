'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  MapPin,
  Clock,
  Phone,
  Mail,
  Download,
  ArrowLeft,
  Truck,
  Store,
} from 'lucide-react';
import type { Order } from '@/types';

export function OrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || 'Failed to load order');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-600">{error || 'Order not found'}</div>
        <Button onClick={() => router.push('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. We've received it and will start preparing
          it soon.
        </p>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Order Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Order Number</span>
                <span className="font-mono text-lg">{order.orderNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Order Date</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="text-lg font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery/Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {order.deliveryType === 'delivery' ? (
                  <Truck className="mr-2 h-5 w-5" />
                ) : (
                  <Store className="mr-2 h-5 w-5" />
                )}
                {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}{' '}
                Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.deliveryType === 'delivery' ? (
                <div>
                  <h4 className="mb-2 flex items-center font-medium">
                    <MapPin className="mr-1 h-4 w-4" />
                    Delivery Address
                  </h4>
                  {order.deliveryAddress ? (
                    <div className="ml-5 text-gray-700">
                      <p>{order.deliveryAddress.street}</p>
                      {order.deliveryAddress.unit && (
                        <p>Unit {order.deliveryAddress.unit}</p>
                      )}
                      <p>
                        {order.deliveryAddress.city},{' '}
                        {order.deliveryAddress.province}{' '}
                        {order.deliveryAddress.postalCode}
                      </p>
                    </div>
                  ) : (
                    <p className="ml-5 text-gray-500">Address not available</p>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="mb-2 flex items-center font-medium">
                    <MapPin className="mr-1 h-4 w-4" />
                    Pickup Location
                  </h4>
                  <div className="ml-5 text-gray-700">
                    <p>123 Main Street</p>
                    <p>Toronto, ON M5V 3A8</p>
                    <p className="mt-1 flex items-center text-sm text-gray-600">
                      <Phone className="mr-1 h-3 w-3" />
                      (416) 555-0123
                    </p>
                  </div>
                </div>
              )}

              {order.scheduledFor && (
                <div className="mt-4">
                  <h4 className="mb-2 flex items-center font-medium">
                    <Clock className="mr-1 h-4 w-4" />
                    Scheduled Time
                  </h4>
                  <p className="ml-5 text-gray-700">
                    {formatDateTime(order.scheduledFor)}
                  </p>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="mt-4">
                  <h4 className="mb-2 flex items-center font-medium">
                    <Clock className="mr-1 h-4 w-4" />
                    Estimated{' '}
                    {order.deliveryType === 'delivery'
                      ? 'Delivery'
                      : 'Ready'}{' '}
                    Time
                  </h4>
                  <p className="ml-5 text-gray-700">
                    {formatDateTime(order.estimatedDelivery)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.specialInstructions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Items & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between border-b pb-4 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <Badge variant="secondary">{item.quantity}x</Badge>
                        <span className="font-medium">
                          Menu Item #{item.menuItemId}
                        </span>
                      </div>

                      {item.customizations &&
                        item.customizations.length > 0 && (
                          <div className="ml-6 text-sm text-gray-600">
                            <span className="font-medium">
                              Customizations applied
                            </span>
                          </div>
                        )}

                      {item.specialInstructions && (
                        <div className="ml-6 text-sm text-gray-600">
                          <span className="font-medium">Note:</span>{' '}
                          {item.specialInstructions}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (HST)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {order.deliveryType === 'delivery'
                      ? 'Delivery Fee'
                      : 'Service Fee'}
                  </span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>

                {order.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>${order.tip.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chef's Note */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <h3 className="mb-2 font-semibold text-orange-900">
            A Personal Note from Chef Mina
          </h3>
          <p className="text-orange-800">
            Thank you for choosing our authentic West African cuisine! Each dish
            is prepared with love and traditional recipes passed down through
            generations. We're excited to share the flavors of our heritage with
            you. Enjoy your meal!
          </p>
          <p className="mt-2 text-sm text-orange-700 italic">
            - Chef Mina & Team
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => router.push('/orders')}
          className="flex items-center"
        >
          Track Your Order
        </Button>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
        </Button>

        <Button onClick={() => router.push('/')} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>

      {/* Contact Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="mb-2 font-medium text-blue-900">Need Help?</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              Call us: (416) 555-0123
            </p>
            <p className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email: support@minakitchen.com
            </p>
            <p className="mt-2 text-blue-700">
              We're here to help with any questions about your order!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
