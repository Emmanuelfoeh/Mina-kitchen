'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { useBackNavigation } from '@/lib/navigation';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

export function BackButton({
  fallbackUrl = '/',
  label = 'Back',
  variant = 'ghost',
  size = 'default',
  className = '',
  showIcon = true,
}: BackButtonProps) {
  const { goBack, canGoBack } = useBackNavigation();

  const handleClick = () => {
    goBack(fallbackUrl);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
      aria-label={`${label} to previous page`}
    >
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      {size !== 'icon' && <span>{label}</span>}
    </Button>
  );
}

interface BackLinkProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function BackLink({
  fallbackUrl = '/',
  label = 'Back',
  className = '',
  showIcon = true,
}: BackLinkProps) {
  const { goBack } = useBackNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    goBack(fallbackUrl);
  };

  return (
    <a
      href={fallbackUrl}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 ${className}`}
      aria-label={`${label} to previous page`}
    >
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      <span>{label}</span>
    </a>
  );
}
