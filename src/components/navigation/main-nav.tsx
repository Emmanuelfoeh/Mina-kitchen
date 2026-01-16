'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Settings, LogOut } from 'lucide-react';
import { ResponsiveNav } from '@/components/ui/responsive-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartSafe } from '@/components/cart';
import { useUserStore } from '@/stores/user-store';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { announceToScreenReader } from '@/lib/accessibility';

export function MainNav() {
  const { getTotalItems, toggleCart } = useCartSafe();
  const { user, isAuthenticated, logout } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = getTotalItems();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/packages', label: 'Packages' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleCartToggle = () => {
    toggleCart();
    announceToScreenReader(
      `Shopping cart ${totalItems > 0 ? `with ${totalItems} items` : 'is empty'} ${
        totalItems > 0 ? 'opened' : 'opened'
      }`
    );
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    announceToScreenReader(
      `Mobile menu ${!isMobileMenuOpen ? 'opened' : 'closed'}`
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      announceToScreenReader('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <ResponsiveNav
      brand={
        <Link
          href="/"
          className="flex items-center space-x-2 rounded-md focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none"
          aria-label="Mina Kitchen - Go to homepage"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
            <span className="text-sm font-bold text-white" aria-hidden="true">
              MK
            </span>
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
            onClick={handleCartToggle}
            className="relative focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label={`Shopping cart with ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
            aria-describedby="cart-status"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
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
            <div className="flex items-center space-x-2">
              {/* Admin Button - Only show for admin users */}
              {user?.role === 'ADMIN' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}

              <Button variant="ghost" size="sm" asChild>
                <Link href="/subscriptions">Subscriptions</Link>
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile" aria-label="User profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
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
      {navLinks.map(link => {
        const isActive =
          pathname === link.href ||
          (link.href !== '/' && pathname?.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'hover:text-primary rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary bg-primary/5 font-bold'
                : 'text-gray-700 hover:bg-neutral-100 dark:text-gray-300 dark:hover:bg-neutral-800'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </ResponsiveNav>
  );
}
