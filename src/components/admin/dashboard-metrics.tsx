'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  DollarSign,
  Wallet,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardMetrics {
  totalRevenue: { value: number; change: number };
  totalOrders: { value: number; change: number };
  avgOrderValue: { value: number; change: number };
  pendingDeliveries: { value: number };
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[160px] animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-gray-200"></div>
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-8 w-20 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full py-8 text-center text-gray-500">
          Failed to load dashboard metrics
        </div>
      </div>
    );
  }

  const metricItems = [
    {
      title: 'Total Revenue',
      value: `$${metrics.totalRevenue.value.toLocaleString()}`,
      change: metrics.totalRevenue.change,
      icon: Wallet,
      color: 'bg-red-50 text-red-500',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.value.toString(),
      change: metrics.totalOrders.change,
      icon: ShoppingCart,
      color: 'bg-orange-50 text-orange-500',
    },
    {
      title: 'Avg. Order Value',
      value: `$${metrics.avgOrderValue.value.toFixed(2)}`,
      change: metrics.avgOrderValue.change,
      icon: DollarSign,
      color: 'bg-red-50 text-red-500',
    },
    {
      title: 'Pending Delivery',
      value: `${metrics.pendingDeliveries.value} Orders`,
      change: metrics.pendingDeliveries.value,
      icon: Truck,
      color: 'bg-orange-50 text-orange-500',
      isAction: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metricItems.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;
        const trendColor = metric.isAction
          ? 'bg-red-100 text-red-700'
          : isPositive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700';

        return (
          <div
            key={index}
            className="flex h-[160px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={cn('rounded-xl p-3', metric.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold',
                  trendColor
                )}
              >
                {metric.isAction ? (
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                ) : isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {metric.isAction
                  ? metric.change
                  : `${isPositive ? '+' : ''}${metric.change.toFixed(1)}%`}
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                {metric.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {metric.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
