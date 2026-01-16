'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const timeframes = ['Week', 'Month', 'Year'];

interface DailyRevenue {
  date: string;
  revenue: number;
}

export function RevenueChart() {
  const [activeFrame, setActiveFrame] = useState('Week');
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          // Process daily revenue data
          const processedData =
            data.dailyRevenue?.map((item: any) => ({
              date: new Date(item.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
              }),
              revenue: item._sum.total || 0,
            })) || [];
          setDailyRevenue(processedData);
        }
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, []);

  // Create SVG path command
  const createPath = (points: number[]) => {
    if (points.length === 0) return '';

    // Width is percentage based, we'll map points to 0-100 x coordinates
    const stepX = 100 / (points.length - 1);

    let path = `M 0,${100 - points[0]}`;

    for (let i = 0; i < points.length - 1; i++) {
      const xd = stepX;
      const currentX = i * stepX;
      const nextX = (i + 1) * stepX;
      const currentY = 100 - points[i];
      const nextY = 100 - points[i + 1];

      // Control points for smooth bezier curve
      const c1x = currentX + xd * 0.5;
      const c1y = currentY;
      const c2x = nextX - xd * 0.5;
      const c2y = nextY;

      path += ` C ${c1x},${c1y} ${c2x},${c2y} ${nextX},${nextY}`;
    }

    return path;
  };

  // Convert revenue data to percentage points for visualization
  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
  const dataPoints = dailyRevenue.map(d => (d.revenue / maxRevenue) * 80 + 10); // Scale to 10-90 range
  const labels =
    dailyRevenue.length > 0
      ? dailyRevenue.map(d => d.date)
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Fallback data points if no real data
  const fallbackPoints = [25, 60, 50, 35, 60, 40, 55];
  const curvePoints = dataPoints.length > 0 ? dataPoints : fallbackPoints;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex rounded-lg bg-gray-50 p-1">
            {timeframes.map(frame => (
              <div
                key={frame}
                className="mr-1 h-6 w-12 animate-pulse rounded-md bg-gray-200 px-4 py-1.5 text-xs font-medium"
              ></div>
            ))}
          </div>
        </div>
        <div className="h-[240px] animate-pulse rounded bg-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
          <p className="text-sm text-gray-500">Daily revenue performance</p>
        </div>
        <div className="flex rounded-lg bg-gray-50 p-1">
          {timeframes.map(frame => (
            <button
              key={frame}
              onClick={() => setActiveFrame(frame)}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                activeFrame === frame
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              {frame}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[240px] w-full">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d={`${createPath(curvePoints)} L 100,100 L 0,100 Z`}
            fill="url(#chartGradient)"
          />

          {/* Main line */}
          <path
            d={createPath(curvePoints)}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* X-Axis Labels */}
        <div className="mt-4 flex justify-between px-2 text-xs font-medium text-gray-400">
          {labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
