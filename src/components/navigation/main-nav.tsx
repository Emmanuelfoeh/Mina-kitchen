'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { ResponsiveNav } from '@/components/ui/responsive-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartSafe } from '@/components/cart';
import { useUserStore } from '@/stores/user-store';

export function MainNav() {
  const { getTotalItems, toggleCart } = useCartSafe();
  const { user, isAuthenticated } = useUserStore();
  const totalItems = getTotalItems();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '#packages', label: 'Packages' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <ResponsiveNav
      brand={
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
            <span className="text-sm font-bold text-white">MK</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Mina Kitchen</span>
        </Link>
      }
      actions={
        <div className="flex items-center space-x-4">
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative"
            aria-label={`Shopping cart with ${totalItems} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile" aria-label="User profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      }
    >
      {/* Navigation Links */}
      {navLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-orange-600"
        >
          {link.label}
        </Link>
      ))}
    </ResponsiveNav>
  );
}
