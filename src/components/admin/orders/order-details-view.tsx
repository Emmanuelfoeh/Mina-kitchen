'use client';

import { useEffect, useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle,
  User,
  DollarSign,
  FileText,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface OrderDetailsViewProps {
  orderId: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customizations: string;
    specialInstructions?: string;
    menuItem: {
      id: string;
      name: string;
      description: string;
      image: string;
      basePrice: number;
      category: {
        name: string;
      };
    };
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: string;
  deliveryType: string;
  scheduledFor?: string;
  estimatedDelivery?: string;
  paymentStatus: string;
  specialInstructions?: string;
  deliveryAddress?: {
    street: string;
    unit?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
  READY: 'bg-purple-100 text-purple-700 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export function OrderDetailsView({ orderId }: OrderDetailsViewProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  async function fetchOrderDetails() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load order details'
      );
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseCustomizations = (customizationsString: string) => {
    try {
      return JSON.parse(customizationsString || '[]');
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">{error || 'Order not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Order {order.orderNumber}
              </CardTitle>
              <p className="mt-1 text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-sm font-medium',
                statusColors[order.status] || 'bg-gray-100 text-gray-700'
              )}
            >
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                {order.customer.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{order.customer.email}</span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {order.customer.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {order.deliveryAddress && (
              <div>
                <h5 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </h5>
                <div className="ml-6 text-sm text-gray-600">
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {order.items.map((item, index) => {
              const customizations = parseCustomizations(item.customizations);

              return (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.menuItem.image || '/placeholder-food.svg'}
                    alt={item.menuItem.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.menuItem.name}
                        </h4>
                        <p className="mb-2 text-sm text-gray-500">
                          {item.menuItem.category.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × $
                          {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Customizations */}
                    {customizations.length > 0 && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <h5 className="mb-2 text-xs font-medium text-gray-700">
                          Customizations:
                        </h5>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {customizations.map((custom: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                              <span>
                                {custom.name}: {custom.value}
                                {custom.price && custom.price > 0 && (
                                  <span className="ml-1 text-green-600">
                                    (+${custom.price.toFixed(2)})
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3">
                        <h5 className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700">
                          <FileText className="h-3 w-3" />
                          Special Instructions:
                        </h5>
                        <p className="text-xs text-blue-600">
                          {item.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <Separator />

            {/* Order Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip</span>
                  <span>${order.tip.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Type:</span>
                <Badge variant="secondary" className="text-xs">
                  {order.deliveryType}
                </Badge>
              </div>

              {order.scheduledFor && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="font-medium">
                    {formatDate(order.scheduledFor)}
                  </span>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Estimated:</span>
                  <span className="font-medium">
                    {formatDate(order.estimatedDelivery)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Payment Status:</span>
                <Badge variant="outline" className="text-xs">
                  {order.paymentStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4">
              <h5 className="mb-2 flex items-center gap-2 font-medium text-yellow-800">
                <FileText className="h-4 w-4" />
                Order Special Instructions
              </h5>
              <p className="text-sm text-yellow-700">
                {order.specialInstructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
