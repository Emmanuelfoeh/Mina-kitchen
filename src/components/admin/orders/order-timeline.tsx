'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  orderId: string;
  currentStatus: string;
}

interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  description: string;
  actor?: string;
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    description: 'Order placed and awaiting confirmation',
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    description: 'Order confirmed and added to kitchen queue',
  },
  PREPARING: {
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    description: 'Kitchen is preparing your order',
  },
  READY: {
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    description: 'Order is ready for pickup/delivery',
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'Order is out for delivery',
  },
  DELIVERED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    description: 'Order has been delivered successfully',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    description: 'Order has been cancelled',
  },
};

export function OrderTimeline({ orderId, currentStatus }: OrderTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderTimeline();
  }, [orderId, currentStatus]);

  async function fetchOrderTimeline() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}/timeline`);

      if (response.ok) {
        const result = await response.json();
        setTimeline(result.data || []);
      } else {
        // If timeline API doesn't exist yet, generate basic timeline from current status
        generateBasicTimeline();
      }
    } catch (error) {
      console.error('Failed to fetch order timeline:', error);
      // Fallback to basic timeline generation
      generateBasicTimeline();
    } finally {
      setLoading(false);
    }
  }

  function generateBasicTimeline() {
    const now = new Date();
    const events: TimelineEvent[] = [];

    // Always start with order placed
    events.push({
      id: '1',
      status: 'PENDING',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      description: 'Order placed by customer',
      actor: 'Customer',
    });

    // Add current status if different from PENDING
    if (currentStatus !== 'PENDING') {
      events.push({
        id: '2',
        status: currentStatus,
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        description:
          statusConfig[currentStatus as keyof typeof statusConfig]
            ?.description || 'Status updated',
        actor: 'Admin',
      });
    }

    setTimeline(events);
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex animate-pulse items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map((event, index) => {
        const config = statusConfig[event.status as keyof typeof statusConfig];
        const Icon = config?.icon || Clock;
        const isLast = index === timeline.length - 1;
        const isCurrent = event.status === currentStatus;

        return (
          <div key={event.id} className="relative flex items-start gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute top-8 left-4 h-full w-px bg-gray-200"></div>
            )}

            {/* Status icon */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2',
                config?.bgColor,
                config?.borderColor,
                isCurrent && 'ring-2 ring-orange-500 ring-offset-2'
              )}
            >
              <Icon className={cn('h-4 w-4', config?.color)} />
            </div>

            {/* Event details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-gray-900' : 'text-gray-700'
                  )}
                >
                  {config?.description || event.description}
                </h4>
                <time className="text-xs text-gray-500">
                  {formatTime(event.timestamp)}
                </time>
              </div>

              {event.actor && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>by {event.actor}</span>
                </div>
              )}

              {isCurrent && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                    Current Status
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
