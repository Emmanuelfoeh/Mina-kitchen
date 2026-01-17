'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MenuFilters } from './menu-filters';
import { MenuGrid } from './menu-grid';
import { Button } from '@/components/ui/button';
import { formatCurrency, generateId } from '@/utils';
import { generateSlug } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import type { MenuItem, MenuCategory, CartItem } from '@/types';

export function MenuBrowser() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCartStore();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories');
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        } else {
          setError('Failed to load categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch menu items when filters change
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        params.append('status', 'ACTIVE');

        const response = await fetch(`/api/menu/items?${params.toString()}`);
        const result = await response.json();
        if (result.success) {
          setMenuItems(result.data);
        } else {
          setError('Failed to load menu items');
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, searchQuery]);

  const handleCustomizeClick = (menuItem: MenuItem) => {
    const slug = menuItem.slug || generateSlug(menuItem.name);
    router.push(`/menu/items/${slug}`);
  };

  // Handler for quick-add items (for simple items without customizations)
  const handleQuickAdd = (menuItem: MenuItem) => {
    const cartItem: CartItem = {
      id: generateId(),
      menuItemId: menuItem.id,
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: menuItem.basePrice,
      totalPrice: menuItem.basePrice,
    };

    addItem(cartItem);
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">😕</div>
          <h3 className="mb-2 text-xl font-semibold text-[#1c100d]">
            Something went wrong
          </h3>
          <p className="text-[#5c4a45]">{error}</p>
          <Button
            onClick={() => window.location.reload()}
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
        isLoading={isLoading}
        onCustomizeClick={handleCustomizeClick}
        onQuickAdd={handleQuickAdd}
      />
    </div>
  );
}
