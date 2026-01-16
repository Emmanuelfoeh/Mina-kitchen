'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  ShoppingBag,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface UserProfileDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    addresses: Array<{
      id: string;
      street: string;
      unit?: string;
      city: string;
      province: string;
      postalCode: string;
      isDefault: boolean;
    }>;
    orders: Array<{
      id: string;
      orderNumber: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
    _count: {
      orders: number;
      addresses: number;
    };
  };
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

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PREPARING: Package,
  READY: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: Clock,
};

export function UserProfileDetails({ user }: UserProfileDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: (typeof user.addresses)[0]) => {
    return `${address.street}${address.unit ? `, ${address.unit}` : ''}, ${address.city}, ${address.province} ${address.postalCode}`;
  };

  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue =
    user.orders.length > 0 ? totalSpent / user.orders.length : 0;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders ({user._count.orders})</TabsTrigger>
        <TabsTrigger value="addresses">
          Addresses ({user._count.addresses})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{user._count.orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    ${averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  User ID
                </label>
                <p className="font-mono text-sm text-gray-900">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Created
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Status
                </label>
                <p className="text-sm text-gray-900">
                  {user.isVerified ? 'Active' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {user.orders.length > 0 ? (
              <div className="space-y-4">
                {user.orders.map(order => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <StatusIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className={
                            statusColors[order.status] ||
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {order.status.replace('_', ' ')}
                        </Badge>
                        <p className="font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400">
                  This user hasn't placed any orders yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="addresses" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {user.addresses.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map(address => (
                  <div
                    key={address.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <MapPin className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatAddress(address)}
                        </p>
                        {address.isDefault && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Default Address
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">No addresses found</p>
                <p className="text-sm text-gray-400">
                  This user hasn't saved any addresses yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
