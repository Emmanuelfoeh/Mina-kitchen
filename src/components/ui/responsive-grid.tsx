import * as React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'menu-items'
    | 'packages'
    | 'admin-cards'
    | 'auto-fit'
    | 'auto-fill';
  minItemWidth?: string;
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  (
    { className, variant = 'auto-fit', minItemWidth = '250px', ...props },
    ref
  ) => {
    const getGridClasses = () => {
      switch (variant) {
        case 'menu-items':
          return 'grid-menu-items';
        case 'packages':
          return 'grid-packages';
        case 'admin-cards':
          return 'grid-admin-cards';
        case 'auto-fit':
        case 'auto-fill':
          return 'grid gap-4 sm:gap-6';
        default:
          return 'grid gap-4';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(getGridClasses(), className)}
        style={
          variant === 'auto-fit' || variant === 'auto-fill'
            ? {
                gridTemplateColumns: `repeat(${variant === 'auto-fit' ? 'auto-fit' : 'auto-fill'}, minmax(${minItemWidth}, 1fr))`,
              }
            : undefined
        }
        {...props}
      />
    );
  }
);
ResponsiveGrid.displayName = 'ResponsiveGrid';

export { ResponsiveGrid };
