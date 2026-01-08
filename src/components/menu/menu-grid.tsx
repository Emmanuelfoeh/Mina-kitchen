'use client';

import { MenuItemCard } from './menu-item-card';
import { MenuSkeleton } from './menu-skeleton';
import type { MenuItem } from '@/types';

interface MenuGridProps {
  menuItems: MenuItem[];
  isLoading: boolean;
  onCustomizeClick: (menuItem: MenuItem) => void;
}

export function MenuGrid({
  menuItems,
  isLoading,
  onCustomizeClick,
}: MenuGridProps) {
  if (isLoading) {
    return <MenuSkeleton />;
  }

  if (menuItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">🍽️</div>
        <h3 className="mb-2 text-xl font-semibold text-[#1c100d]">
          No dishes found
        </h3>
        <p className="text-[#5c4a45]">
          Try adjusting your search or filter criteria to find what you're
          looking for.
        </p>
      </div>
    );
  }

  // Group items by category for better organization
  const itemsByCategory = menuItems.reduce(
    (acc, item) => {
      const categoryName = item.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(itemsByCategory).map(([categoryName, items]) => (
        <div key={categoryName} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1c100d]">
              {categoryName}
            </h2>
            <span className="rounded-full bg-[#f2330d]/10 px-3 py-1 text-sm text-[#5c4a45]">
              {items.length} {items.length === 1 ? 'dish' : 'dishes'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <MenuItemCard
                key={item.id}
                menuItem={item}
                onCustomizeClick={() => onCustomizeClick(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
