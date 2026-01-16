'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  outForDelivery: number;
  todayOrders: number;
  todayRevenue: number;
  avgOrderValue: number;
  completionRate: number;
}

export function OrdersStats() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderStats() {
      try {
        const response = await fetch('/api/admin/orders/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch order stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-8 text-center text-gray-500">
        Failed to load order statistics
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      description: `${stats.todayOrders} orders today`,
      trend: stats.todayOrders > 0 ? 'up' : 'neutral',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      description: 'Awaiting confirmation',
      trend: 'neutral',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Out for Delivery',
      value: stats.outForDelivery.toLocaleString(),
      icon: Truck,
      description: 'Currently delivering',
      trend: 'neutral',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Today',
      value: stats.completedOrders.toLocaleString(),
      icon: CheckCircle,
      description: `${stats.completionRate.toFixed(1)}% completion rate`,
      trend:
        stats.completionRate > 80
          ? 'up'
          : stats.completionRate > 60
            ? 'neutral'
            : 'down',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon =
          stat.trend === 'up'
            ? TrendingUp
            : stat.trend === 'down'
              ? TrendingDown
              : null;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn('rounded-lg p-2', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-1 text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {TrendIcon && (
                  <TrendIcon
                    className={cn(
                      'h-3 w-3',
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    )}
                  />
                )}
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
