'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { TouchArea } from './touch-target';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
  maxVisibleItems?: number;
}

export function Breadcrumb({
  items,
  className = '',
  showHomeIcon = true,
  maxVisibleItems = 3,
}: BreadcrumbProps) {
  // On mobile, show only the last few items to save space
  const visibleItems =
    items.length > maxVisibleItems ? items.slice(-maxVisibleItems) : items;

  const hasHiddenItems = items.length > maxVisibleItems;

  return (
    <nav
      className={`flex items-center space-x-1 text-xs text-gray-600 sm:space-x-2 sm:text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 sm:space-x-2">
        {hasHiddenItems && (
          <li className="flex items-center">
            <span className="text-gray-400">...</span>
            <ChevronRight
              className="mx-1 h-3 w-3 text-gray-400 sm:mx-2 sm:h-4 sm:w-4"
              aria-hidden="true"
            />
          </li>
        )}

        {visibleItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                className="mx-1 h-3 w-3 text-gray-400 sm:mx-2 sm:h-4 sm:w-4"
                aria-hidden="true"
              />
            )}
            {item.href ? (
              <TouchArea
                onTap={() => (window.location.href = item.href!)}
                className="rounded px-1 py-1 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:px-2"
              >
                <div className="flex items-center gap-1">
                  {showHomeIcon && index === 0 && (
                    <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="max-w-[80px] truncate sm:max-w-none">
                    {item.label}
                  </span>
                </div>
              </TouchArea>
            ) : (
              <span className="max-w-[120px] truncate font-medium text-gray-900 sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
