'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartSafe } from './cart-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CartButton() {
  const { toggleCart, getTotalItems } = useCartSafe();
  const totalItems = getTotalItems();

  return (
    <Button variant="ghost" size="sm" className="relative" onClick={toggleCart}>
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
      <span className="sr-only">Shopping cart with {totalItems} items</span>
    </Button>
  );
}
