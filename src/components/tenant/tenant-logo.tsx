'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTenantContext } from './tenant-provider';
import { Utensils } from 'lucide-react';

interface TenantLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeMap = {
  sm: { width: 32, height: 32, textSize: 'text-lg' },
  md: { width: 40, height: 40, textSize: 'text-xl' },
  lg: { width: 48, height: 48, textSize: 'text-2xl' },
};

export function TenantLogo({
  className = '',
  size = 'md',
  showName = true,
}: TenantLogoProps) {
  const { branding, isLoading } = useTenantContext();
  const { width, height, textSize } = sizeMap[size];

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className="animate-pulse rounded bg-gray-200"
          style={{ width, height }}
        />
        {showName && (
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        )}
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {branding?.logo ? (
        <Image
          src={branding.logo}
          alt={`${branding.name} logo`}
          width={width}
          height={height}
          className="object-contain"
        />
      ) : (
        <div
          className="rounded-full p-2"
          style={{
            backgroundColor: branding?.primaryColor || '#ef4444',
            width,
            height,
          }}
        >
          <Utensils className="h-full w-full text-white" />
        </div>
      )}
      {showName && (
        <span
          className={`font-bold ${textSize}`}
          style={{ color: branding?.primaryColor || '#ef4444' }}
        >
          {branding?.name || 'Mina Kitchen'}
        </span>
      )}
    </Link>
  );
}
