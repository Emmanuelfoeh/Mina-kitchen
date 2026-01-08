import * as React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'centered' | 'full-width' | 'constrained';
}

const ResponsiveContainer = React.forwardRef<
  HTMLDivElement,
  ResponsiveContainerProps
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'container-responsive',
    centered: 'container-responsive max-w-4xl',
    'full-width': 'w-full px-4 sm:px-6 lg:px-8',
    constrained: 'container-responsive max-w-7xl',
  };

  return (
    <div ref={ref} className={cn(variants[variant], className)} {...props} />
  );
});
ResponsiveContainer.displayName = 'ResponsiveContainer';

export { ResponsiveContainer };
