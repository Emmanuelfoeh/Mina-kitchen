'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuFilters } from './menu-filters';
import { MenuGrid } from './menu-grid';
import { Button } from '@/components/ui/button';
import { generateId } from '@/utils';
import { generateSlug } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import {
  useMenuItems,
  useMenuCategories,
} from '@/hooks/queries/use-menu-queries';
import type { MenuItem, CartItem } from '@/types';

export function MenuBrowser() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { addItem } = useCartStore();

  // Fetch categories using TanStack Query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useMenuCategories();

  // Fetch menu items with filters using TanStack Query
  const {
    data: menuItems = [],
    isLoading: itemsLoading,
    error: itemsError,
    refetch,
  } = useMenuItems({
    category: selectedCategory,
    search: searchQuery,
    status: 'ACTIVE',
  });

  const handleCustomizeClick = (menuItem: MenuItem) => {
    const slug = menuItem.slug || generateSlug(menuItem.name);
    router.push(`/menu/items/${slug}`);
  };

  // Handler for quick-add items (for simple items without customizations)
  const handleQuickAdd = (menuItem: MenuItem) => {
    const cartItem: CartItem = {
      id: generateId(),
      menuItemId: menuItem.id,
      name: menuItem.name,
      image: menuItem.image,
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: menuItem.basePrice,
      totalPrice: menuItem.basePrice,
    };

    addItem(cartItem);
  };

  // Handle errors
  const error = categoriesError || itemsError;
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">😕</div>
          <h3 className="mb-2 text-xl font-semibold text-[#1c100d]">
            Something went wrong
          </h3>
          <p className="text-[#5c4a45]">
            {error instanceof Error
              ? error.message
              : 'Failed to load menu data'}
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-4 bg-[#f2330d] text-white hover:bg-[#d12b0a]"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8">
      {/* Filters */}
      <MenuFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Menu Grid */}
      <MenuGrid
        menuItems={menuItems}
        isLoading={itemsLoading || categoriesLoading}
        selectedCategory={selectedCategory}
        onCustomizeClick={handleCustomizeClick}
        onQuickAdd={handleQuickAdd}
      />
    </div>
  );
}
