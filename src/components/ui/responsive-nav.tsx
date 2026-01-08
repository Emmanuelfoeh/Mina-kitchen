'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ResponsiveNavProps {
  children: React.ReactNode;
  className?: string;
  brand?: React.ReactNode;
  actions?: React.ReactNode;
}

const ResponsiveNav = React.forwardRef<HTMLElement, ResponsiveNavProps>(
  ({ children, className, brand, actions }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <nav
        ref={ref}
        className={cn(
          'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur',
          className
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand/Logo */}
            {brand && <div className="flex-shrink-0">{brand}</div>}

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {children}
              </div>
            </div>

            {/* Actions (Cart, User menu, etc.) */}
            {actions && <div className="hidden md:block">{actions}</div>}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <div className="flex items-center space-x-2">
                {actions && (
                  <div className="flex items-center space-x-2">{actions}</div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  aria-label="Toggle navigation menu"
                >
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isOpen && (
            <div className="md:hidden">
              <div className="space-y-1 border-t px-2 pt-2 pb-3 sm:px-3">
                {children}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }
);
ResponsiveNav.displayName = 'ResponsiveNav';

export { ResponsiveNav };
