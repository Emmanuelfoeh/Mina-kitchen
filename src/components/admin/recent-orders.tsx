'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    menuItem: {
      name: string;
    };
    quantity: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  READY: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.recentOrders || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentOrders();
  }, []);

  const formatOrderItems = (items: RecentOrder['items']) => {
    return items
      .map(item => `${item.quantity}x ${item.menuItem.name}`)
      .join(', ');
  };

  const getCustomerImage = (email: string) => {
    // Generate a consistent avatar based on email
    const hash = email.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    return `https://images.unsplash.com/photo-${1500000000000 + imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80`;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 py-4"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-3 w-48 rounded bg-gray-200"></div>
              </div>
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <Filter className="h-3.5 w-3.5" />
          All Status
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length > 0 ? (
              orders.map(order => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getCustomerImage(order.customer.email)}
                        alt={order.customer.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {order.customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-600">
                    {formatOrderItems(order.items)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold',
                        statusColors[order.status] ||
                          'bg-gray-100 text-gray-700'
                      )}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No recent orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
