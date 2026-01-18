'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { generateId } from '@/utils';
import type { MenuItem, CartItem } from '@/types';

export function PopularDishes() {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchPopularDishes();
  }, []);

  const fetchPopularDishes = async () => {
    try {
      setLoading(true);
      // Fetch menu items and get the first 3 active ones as "popular"
      const response = await fetch('/api/menu/items?status=ACTIVE&limit=3');
      const result = await response.json();

      if (result.success) {
        setDishes(result.data);
      }
    } catch (error) {
      console.error('Error fetching popular dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (dish: MenuItem) => {
    const cartItem: CartItem = {
      id: generateId(),
      menuItemId: dish.id,
      name: dish.name,
      image: dish.image,
      quantity: 1,
      selectedCustomizations: [],
      unitPrice: dish.basePrice,
      totalPrice: dish.basePrice,
    };

    addItem(cartItem);
  };

  if (loading) {
    return (
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
          <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-3xl leading-tight font-bold tracking-[-0.02em] text-[#1c100d]">
                Popular Dishes
              </h2>
              <p className="mt-2 text-[#5c4a45]">
                Local favorites that our customers can't get enough of.
              </p>
            </div>
            <Link
              href="/menu"
              className="flex items-center gap-1 text-sm font-semibold text-[#f2330d] hover:underline"
            >
              View Full Menu <ArrowRight className="text-[18px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-[#fcf9f8]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <div className="h-full w-full animate-pulse bg-gray-200"></div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 lg:px-40">
        <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-3xl leading-tight font-bold tracking-[-0.02em] text-[#1c100d]">
              Popular Dishes
            </h2>
            <p className="mt-2 text-[#5c4a45]">
              Local favorites that our customers can't get enough of.
            </p>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-sm font-semibold text-[#f2330d] hover:underline"
          >
            View Full Menu <ArrowRight className="text-[18px]" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {dishes.map((dish, index) => (
            <Card
              key={dish.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-[#fcf9f8] transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div
                  className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${dish.image}')`,
                  }}
                ></div>
                {index === 0 && (
                  <div className="absolute top-3 right-3 rounded-md bg-white px-2 py-1 shadow-sm">
                    <span className="text-xs font-bold text-[#f2330d]">
                      Top Rated
                    </span>
                  </div>
                )}
                {dish.tags?.includes('spicy') && (
                  <div className="absolute top-3 right-3 rounded-md bg-white px-2 py-1 shadow-sm">
                    <span className="text-xs font-bold text-orange-600">
                      Spicy
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg leading-tight font-bold text-[#1c100d]">
                    {dish.name}
                  </h3>
                  <span className="text-lg font-bold text-[#f2330d]">
                    ${dish.basePrice.toFixed(2)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[#5c4a45]">
                  {dish.description}
                </p>
                <Button
                  onClick={() => handleAddToCart(dish)}
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-[#f2330d] bg-white py-2.5 text-sm font-bold text-[#f2330d] transition-colors hover:bg-[#f2330d] hover:text-white"
                >
                  <Plus className="text-[18px]" />
                  Add to Order
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
