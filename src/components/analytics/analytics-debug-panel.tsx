'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAnalyticsConfig } from '@/lib/analytics';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  custom_parameters?: Record<string, any>;
}

/**
 * Analytics debug panel for development - shows tracked events and metrics
 * Only visible in development mode
 */
export function AnalyticsDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') return;

    setConfig(getAnalyticsConfig());

    // Listen for analytics events (this would need to be implemented in the analytics system)
    const handleAnalyticsEvent = (event: CustomEvent<AnalyticsEvent>) => {
      setEvents(prev => [...prev.slice(-49), event.detail]); // Keep last 50 events
    };

    // This would be dispatched from the analytics system
    window.addEventListener('analytics-event' as any, handleAnalyticsEvent);

    return () => {
      window.removeEventListener(
        'analytics-event' as any,
        handleAnalyticsEvent
      );
    };
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          📊 Analytics Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-96 w-96 overflow-hidden">
      <Card className="border bg-white shadow-lg">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Analytics Debug</h3>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              ✕
            </Button>
          </div>

          {/* Configuration */}
          {config && (
            <div className="mb-4 rounded bg-gray-50 p-2 text-sm">
              <div className="mb-1 font-medium">Configuration:</div>
              <div>Enabled: {config.enabled ? '✅' : '❌'}</div>
              <div>Debug: {config.debug ? '✅' : '❌'}</div>
              <div>Tracking ID: {config.trackingId || 'Not set'}</div>
            </div>
          )}

          {/* Event Statistics */}
          <div className="mb-4">
            <div className="mb-2 text-sm font-medium">Event Summary:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Total Events: {events.length}</div>
              <div>
                Page Views: {events.filter(e => e.event === 'page_view').length}
              </div>
              <div>
                Customizations:{' '}
                {
                  events.filter(e => e.event === 'customization_selection')
                    .length
                }
              </div>
              <div>
                Cart Adds:{' '}
                {events.filter(e => e.event === 'add_to_cart').length}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <div className="mb-2 text-sm font-medium">Recent Events:</div>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {events
                .slice(-10)
                .reverse()
                .map((event, index) => (
                  <div key={index} className="rounded bg-gray-50 p-2 text-xs">
                    <div className="mb-1 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {event.event}
                      </Badge>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {event.category} → {event.action}
                      {event.label && ` → ${event.label}`}
                    </div>
                    {event.value !== undefined && (
                      <div className="text-blue-600">Value: {event.value}</div>
                    )}
                    {event.custom_parameters &&
                      Object.keys(event.custom_parameters).length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-gray-600">
                            Parameters
                          </summary>
                          <pre className="mt-1 overflow-x-auto rounded bg-white p-1 text-xs">
                            {JSON.stringify(event.custom_parameters, null, 2)}
                          </pre>
                        </details>
                      )}
                  </div>
                ))}
              {events.length === 0 && (
                <div className="py-4 text-center text-gray-500">
                  No events tracked yet
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => setEvents([])}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Clear Events
            </Button>
            <Button
              onClick={() => {
                const data = JSON.stringify(events, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-events-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
