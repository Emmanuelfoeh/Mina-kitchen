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

  const { addItem } = useCartStore();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories');
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch menu items when filters change
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        params.append('status', 'active');

        const response = await fetch(`/api/menu/items?${params.toString()}`);
        const result = await response.json();
        if (result.success) {
          setMenuItems(result.data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
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

  // Handler for adding packages to cart
  const handleAddPackage = (
    packageName: string,
    price: number,
    description: string
  ) => {
    const packageItem: CartItem = {
      id: generateId(),
      menuItemId: `package-${packageName.toLowerCase().replace(/\s+/g, '-')}`,
      quantity: 1,
      selectedCustomizations: [],
      specialInstructions: `Package: ${packageName}`,
      unitPrice: price,
      totalPrice: price,
    };

    addItem(packageItem);
  };

  // Handler for adding side items directly to cart
  const handleAddSideItem = (name: string, price: number) => {
    const sideItem: CartItem = {
      id: generateId(),
      menuItemId: `side-${name.toLowerCase().replace(/\s+/g, '-')}`,
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: price,
      totalPrice: price,
    };

    addItem(sideItem);
  };

  // Handler for viewing all sides
  const handleViewAllSides = () => {
    setSelectedCategory('Sides');
  };

  // Get featured/signature items (first 4 items)
  const signatureItems = menuItems.slice(0, 4);

  return (
    <div className="space-y-12 py-8">
      {/* Categories Sticky Bar */}
      <div className="sticky top-[65px] z-40 -mx-4 border-b border-[#e6dbd9] bg-[#fcf9f8]/95 px-4 py-3 backdrop-blur-sm md:-mx-10 md:px-10">
        <MenuFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Chef's Signatures Section */}
      {selectedCategory === 'all' && !searchQuery && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[#1c100d] md:text-3xl">
              <span className="block h-6 w-1.5 rounded-full bg-[#f2330d]"></span>
              Chef's Signatures
            </h2>
            {/* <button className="flex items-center gap-1 text-sm font-semibold text-[#f2330d] hover:underline">
              View All →
            </button> */}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {signatureItems.map(item => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e6dbd9] bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#f2330d]/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  {item.tags.includes('popular') && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-[#1c100d] shadow-sm backdrop-blur-sm">
                      🔥 Best Seller
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg leading-tight font-bold text-[#1c100d]">
                      {item.name}
                    </h3>
                    <span className="text-lg font-bold text-[#f2330d]">
                      {formatCurrency(item.basePrice)}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-[#5c4a45]">
                    {item.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e6dbd9] pt-4">
                    <div className="flex gap-1 text-xs text-[#5c4a45]">
                      {item.tags.includes('spicy') && (
                        <span className="rounded bg-[#f4e9e7] px-2 py-1">
                          Spicy
                        </span>
                      )}
                      {item.tags.includes('vegetarian') && (
                        <span className="rounded bg-[#f4e9e7] px-2 py-1">
                          Vegetarian
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleCustomizeClick(item)}
                      className="h-9 flex-1 rounded-lg bg-[#f2330d] text-sm font-semibold text-white transition-colors hover:bg-[#d12b0a]"
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Family & Party Packages Section */}
      {selectedCategory === 'all' && !searchQuery && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[#1c100d] md:text-3xl">
              <span className="block h-6 w-1.5 rounded-full bg-[#f2330d]"></span>
              Family & Party Packages
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Package Card 1 */}
            <div className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl bg-[#2d1a16] shadow-lg sm:flex-row">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-40 transition-opacity group-hover:opacity-30"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />

              <div className="relative z-10 flex h-full w-full flex-col justify-center p-8 sm:w-2/3">
                <span className="mb-2 text-xs font-bold tracking-wider text-[#f2330d] uppercase">
                  BEST VALUE
                </span>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  The "Owambe" Weekend Box
                </h3>
                <p className="mb-4 text-sm text-gray-300">
                  Everything you need for a family feast. Serves 4-6 people.
                </p>

                <ul className="mb-6 space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    ✓ 2 Trays of Rice (Jollof/Fried)
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Choice of 2 Proteins
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ 4 Portions of Sides
                  </li>
                </ul>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-white">$120</span>
                  <Button
                    onClick={() =>
                      handleAddPackage(
                        'The Owambe Weekend Box',
                        120,
                        'Everything you need for a family feast. Serves 4-6 people.'
                      )
                    }
                    className="h-10 rounded-lg bg-[#f2330d] px-6 font-bold text-white transition-colors hover:bg-[#d12b0a]"
                  >
                    Select Package
                  </Button>
                </div>
              </div>
            </div>

            {/* Package Card 2 */}
            <div className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[#e6dbd9] bg-white shadow-sm hover:shadow-lg sm:flex-row">
              <div
                className="min-h-[200px] w-full bg-cover bg-center sm:min-h-full sm:w-2/5"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                }}
              />

              <div className="flex w-full flex-col justify-center p-6 sm:w-3/5 sm:p-8">
                <h3 className="mb-2 text-2xl font-bold text-[#1c100d]">
                  Grill Master Platter
                </h3>
                <p className="mb-4 text-sm text-[#5c4a45]">
                  A protein-lover's dream. Perfect for sharing with friends.
                </p>

                <ul className="mb-6 space-y-1 text-sm text-[#5c4a45]">
                  <li className="flex items-center gap-2">
                    ✓ 4 Suya Skewers (Beef)
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ 1 Whole Grilled Fish
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Spicy Pepper Sauce & Onions
                  </li>
                </ul>

                <div className="mt-auto flex items-center justify-between border-t border-[#e6dbd9] pt-4">
                  <span className="text-2xl font-bold text-[#1c100d]">$85</span>
                  <Button
                    onClick={() =>
                      handleAddPackage(
                        'Grill Master Platter',
                        85,
                        "A protein-lover's dream. Perfect for sharing with friends."
                      )
                    }
                    variant="outline"
                    className="h-10 rounded-lg border-2 border-[#f2330d] px-6 font-bold text-[#f2330d] transition-all hover:bg-[#f2330d] hover:text-white"
                  >
                    Add to Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Menu Grid */}
      {(selectedCategory !== 'all' || searchQuery) && (
        <MenuGrid
          menuItems={menuItems}
          isLoading={isLoading}
          onCustomizeClick={handleCustomizeClick}
        />
      )}

      {/* Sides & Extras Section */}
      {selectedCategory === 'all' && !searchQuery && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[#1c100d] md:text-3xl">
              <span className="block h-6 w-1.5 rounded-full bg-[#f2330d]"></span>
              Sides & Extras
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {/* Mock side items */}
            {[
              {
                name: 'Fried Plantain',
                price: 5.0,
                image:
                  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Moi Moi (Bean Pudding)',
                price: 4.5,
                image:
                  'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Creamy Coleslaw',
                price: 3.0,
                image:
                  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
              },
              {
                name: 'Puff Puff (5 pcs)',
                price: 4.0,
                image:
                  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80',
              },
            ].map((side, index) => (
              <div
                key={index}
                className="group cursor-pointer rounded-xl border border-[#e6dbd9] bg-white p-4 transition-colors hover:border-[#f2330d]/30"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-[#f4e9e7]">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${side.image}')` }}
                  />
                </div>
                <h4 className="text-sm font-bold text-[#1c100d]">
                  {side.name}
                </h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#f2330d]">
                    {formatCurrency(side.price)}
                  </span>
                  <button
                    onClick={() => handleAddSideItem(side.name, side.price)}
                    className="flex size-6 items-center justify-center rounded-full bg-[#f4e9e7] text-[#1c100d] transition-colors hover:bg-[#f2330d] hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* View All Card */}
            <div
              onClick={handleViewAllSides}
              className="group cursor-pointer rounded-xl border border-[#e6dbd9] bg-white p-4 transition-colors hover:border-[#f2330d]/30"
            >
              <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-[#f4e9e7]">
                <div className="text-center text-[#5c4a45]">
                  <div className="mb-1 text-2xl">🍽️</div>
                  <span className="text-xs">View All</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#1c100d]">More Sides</h4>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
