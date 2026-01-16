'use client';

import { usePathname } from 'next/navigation';
import { CartSidebar } from './cart-sidebar';

export function ConditionalCartSidebar() {
  const pathname = usePathname();

  // Don't show cart on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <CartSidebar />;
}
