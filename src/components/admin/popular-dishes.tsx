'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PopularDish {
  id: string;
  name: string;
  image: string;
  category: { name: string };
  orderCount: number;
  totalQuantity: number;
}

export function PopularDishes() {
  const [popularItems, setPopularItems] = useState<PopularDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularDishes() {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setPopularItems(data.popularDishes || []);
        }
      } catch (error) {
        console.error('Failed to fetch popular dishes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularDishes();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gray-200"></div>
              <div className="flex-1">
                <div className="mb-2 h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-3 w-16 rounded bg-gray-200"></div>
              </div>
              <div className="text-right">
                <div className="mb-2 h-4 w-8 rounded bg-gray-200"></div>
                <div className="h-3 w-12 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Popular Dishes</h3>
        <Link
          href="/admin/menu"
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {popularItems.length > 0 ? (
          popularItems.map(item => (
            <div
              key={item.id}
              className="group flex cursor-pointer items-center gap-4 rounded-xl p-2 transition-colors hover:bg-gray-50"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold text-gray-900">
                  {item.name}
                </h4>
                <p className="text-xs font-medium text-gray-500">
                  {item.category.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {item.totalQuantity}
                </p>
                <p className="text-xs font-medium text-gray-400">Sold</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            No popular dishes data available
          </div>
        )}
      </div>
    </div>
  );
}
