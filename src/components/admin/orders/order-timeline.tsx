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
    // For now, we'll generate a mock timeline based on the current status
    // In a real app, this would fetch actual timeline events from the API
    generateMockTimeline();
  }, [currentStatus]);

  function generateMockTimeline() {
    const now = new Date();
    const events: TimelineEvent[] = [];

    // Always start with order placed
    events.push({
      id: '1',
      status: 'PENDING',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      description: 'Order placed by customer',
      actor: 'Customer',
    });

    // Add events based on current status
    const statusOrder = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex >= 1) {
      events.push({
        id: '2',
        status: 'CONFIRMED',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 min ago
        description: 'Order confirmed by restaurant',
        actor: 'Admin',
      });
    }

    if (currentIndex >= 2) {
      events.push({
        id: '3',
        status: 'PREPARING',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
        description: 'Kitchen started preparing order',
        actor: 'Kitchen Staff',
      });
    }

    if (currentIndex >= 3) {
      events.push({
        id: '4',
        status: 'READY',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 min ago
        description: 'Order is ready for pickup/delivery',
        actor: 'Kitchen Staff',
      });
    }

    if (currentIndex >= 4) {
      events.push({
        id: '5',
        status: 'OUT_FOR_DELIVERY',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 min ago
        description: 'Order dispatched for delivery',
        actor: 'Delivery Driver',
      });
    }

    if (currentIndex >= 5) {
      events.push({
        id: '6',
        status: 'DELIVERED',
        timestamp: now.toISOString(),
        description: 'Order delivered successfully',
        actor: 'Delivery Driver',
      });
    }

    // Handle cancelled status
    if (currentStatus === 'CANCELLED') {
      events.push({
        id: 'cancelled',
        status: 'CANCELLED',
        timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), // 20 min ago
        description: 'Order was cancelled',
        actor: 'Admin',
      });
    }

    setTimeline(events);
    setLoading(false);
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
