'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  children: React.ReactNode;
}

/**
 * TouchTarget component optimized for mobile interactions
 * Ensures minimum 44px touch target size as per accessibility guidelines
 */
export const TouchTarget = React.forwardRef<
  HTMLButtonElement,
  TouchTargetProps
>(
  (
    { className, size = 'md', variant = 'default', children, ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: 'min-h-[44px] min-w-[44px] p-2 text-sm',
      md: 'min-h-[48px] min-w-[48px] p-3 text-base',
      lg: 'min-h-[52px] min-w-[52px] p-4 text-lg',
    };

    const variantClasses = {
      default:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          // Touch optimizations
          'touch-manipulation select-none',
          // Active state for better mobile feedback
          'active:scale-95 active:transition-transform active:duration-75',
          // Size and variant classes
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchTarget.displayName = 'TouchTarget';

interface TouchAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onTap?: () => void;
  disabled?: boolean;
}

/**
 * TouchArea component for creating touch-friendly interactive areas
 */
export const TouchArea = React.forwardRef<HTMLDivElement, TouchAreaProps>(
  ({ className, children, onTap, disabled = false, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onTap) {
        onTap();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'min-h-[44px] cursor-pointer touch-manipulation select-none',
          // Interactive states
          'transition-colors duration-150',
          disabled
            ? 'pointer-events-none opacity-50'
            : 'hover:bg-accent/50 active:bg-accent/80 active:scale-[0.98] active:transition-transform active:duration-75',
          // Focus styles
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          className
        )}
        onClick={handleClick}
        role={onTap ? 'button' : undefined}
        tabIndex={onTap && !disabled ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchArea.displayName = 'TouchArea';
