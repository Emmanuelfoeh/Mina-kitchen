'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Flame, Leaf } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/lib/utils';
import type { MenuItem, Package } from '@/types';

interface RelatedItemsProps {
  items: MenuItem[];
  title?: string;
  onQuickAdd?: (item: MenuItem) => void;
  className?: string;
}

export function RelatedItems({
  items,
  title = 'You Might Also Like',
  onQuickAdd,
  className = '',
}: RelatedItemsProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleItemClick = (item: MenuItem) => {
    const slug = item.slug || generateSlug(item.name);
    router.push(`/menu/items/${slug}`);
  };

  const handleQuickAdd = (item: MenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(item);
    } else {
      // Default behavior: navigate to item page
      handleItemClick(item);
    }
  };

  const getStatusBadge = (item: MenuItem) => {
    switch (item.status) {
      case 'sold_out':
        return (
          <Badge className="border-0 bg-red-100 text-red-700">Sold Out</Badge>
        );
      case 'low_stock':
        return (
          <Badge className="border-0 bg-orange-100 text-orange-700">
            Limited
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSpicyIndicator = (item: MenuItem) => {
    if (item.tags.includes('spicy') || item.tags.includes('hot')) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <Flame className="h-3 w-3" />
        </div>
      );
    }
    return null;
  };

  const getVegetarianIndicator = (item: MenuItem) => {
    if (item.tags.includes('vegetarian') || item.tags.includes('vegan')) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <Leaf className="h-3 w-3" />
        </div>
      );
    }
    return null;
  };

  const isAvailable = (item: MenuItem) =>
    item.status === 'active' || item.status === 'low_stock';

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-xl font-bold text-[#1c100d] sm:text-2xl"
          id="related-items-heading"
        >
          {title}
        </h2>

        {/* Navigation buttons */}
        <div
          className="flex gap-2"
          role="group"
          aria-label="Scroll related items"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0"
            aria-label="Scroll related items left"
            aria-describedby="related-items-heading"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0"
            aria-label="Scroll related items right"
            aria-describedby="related-items-heading"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        role="region"
        aria-labelledby="related-items-heading"
        aria-label={`${items.length} related menu items`}
      >
        {items.map((item, index) => (
          <Card
            key={item.id}
            className="group min-w-[280px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-transparent bg-white transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg"
            onClick={() => handleItemClick(item)}
            role="article"
            aria-label={`${item.name} - ${formatCurrency(item.basePrice)} - ${item.description}`}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <div
                className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${item.image}')`,
                }}
                role="img"
                aria-label={`Image of ${item.name}`}
              />

              {/* Status Badge */}
              {getStatusBadge(item) && (
                <div
                  className="absolute top-2 right-2"
                  aria-label={`Status: ${item.status}`}
                >
                  {getStatusBadge(item)}
                </div>
              )}

              {/* Dietary Indicators */}
              <div
                className="absolute bottom-2 left-2 flex gap-1"
                role="group"
                aria-label="Dietary indicators"
              >
                {getSpicyIndicator(item) && (
                  <div aria-label="Spicy dish">{getSpicyIndicator(item)}</div>
                )}
                {getVegetarianIndicator(item) && (
                  <div aria-label="Vegetarian dish">
                    {getVegetarianIndicator(item)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <h3 className="line-clamp-1 text-sm font-bold text-[#1c100d]">
                  {item.name}
                </h3>
                <span
                  className="ml-2 text-sm font-bold text-[#f2330d]"
                  aria-label={`Price: ${formatCurrency(item.basePrice)}`}
                >
                  {formatCurrency(item.basePrice)}
                </span>
              </div>

              <p className="line-clamp-2 text-xs text-[#5c4a45]">
                {item.description}
              </p>

              {/* Category */}
              <div
                className="text-xs text-[#5c4a45]"
                aria-label={`Category: ${item.category.name}`}
              >
                {item.category.name}
              </div>

              {/* Quick Add Button */}
              <Button
                onClick={e => handleQuickAdd(item, e)}
                disabled={!isAvailable(item)}
                size="sm"
                className={`mt-auto flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                  isAvailable(item)
                    ? 'border border-[#f2330d] bg-white text-[#f2330d] hover:bg-[#f2330d] hover:text-white'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
                variant={isAvailable(item) ? 'outline' : 'secondary'}
                aria-label={
                  isAvailable(item)
                    ? `Quick add ${item.name} to cart`
                    : `${item.name} is currently unavailable`
                }
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                {isAvailable(item) ? 'Quick Add' : 'Unavailable'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Package-specific related items component
interface RelatedPackagesProps {
  packages: Package[];
  title?: string;
  onQuickAdd?: (pkg: Package) => void;
  className?: string;
}

export function RelatedPackages({
  packages,
  title = 'Related Packages',
  onQuickAdd,
  className = '',
}: RelatedPackagesProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [packages]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handlePackageClick = (pkg: Package) => {
    const slug = pkg.slug || generateSlug(pkg.name);
    router.push(`/packages/${slug}`);
  };

  const handleQuickAdd = (pkg: Package, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(pkg);
    } else {
      // Default behavior: navigate to package page
      handlePackageClick(pkg);
    }
  };

  // Don't render if no packages
  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-xl font-bold text-[#1c100d] sm:text-2xl"
          id="related-packages-heading"
        >
          {title}
        </h2>

        {/* Navigation buttons */}
        <div
          className="flex gap-2"
          role="group"
          aria-label="Scroll related packages"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0"
            aria-label="Scroll related packages left"
            aria-describedby="related-packages-heading"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0"
            aria-label="Scroll related packages right"
            aria-describedby="related-packages-heading"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        role="region"
        aria-labelledby="related-packages-heading"
        aria-label={`${packages.length} related meal packages`}
      >
        {packages.map((pkg, index) => (
          <Card
            key={pkg.id}
            className="group min-w-[280px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-transparent bg-white transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg"
            onClick={() => handlePackageClick(pkg)}
            role="article"
            aria-label={`${pkg.name} package - ${formatCurrency(pkg.price)} - ${pkg.description}`}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePackageClick(pkg);
              }
            }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <div
                className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${pkg.image}')`,
                }}
                role="img"
                aria-label={`Image of ${pkg.name} package`}
              />

              {/* Package Type Badge */}
              <div
                className="absolute top-2 right-2"
                aria-label={`Package type: ${pkg.type}`}
              >
                <Badge className="border-0 bg-blue-100 text-blue-700">
                  {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}
                </Badge>
              </div>

              {/* Savings Badge */}
              {pkg.savingsAmount && pkg.savingsAmount > 0 && (
                <div
                  className="absolute bottom-2 left-2"
                  aria-label={`Savings: ${pkg.savingsAmount.toFixed(2)} dollars`}
                >
                  <Badge className="border-0 bg-green-100 text-green-700">
                    Save ${pkg.savingsAmount.toFixed(2)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <h3 className="line-clamp-1 text-sm font-bold text-[#1c100d]">
                  {pkg.name}
                </h3>
                <span
                  className="ml-2 text-sm font-bold text-[#f2330d]"
                  aria-label={`Package price: ${formatCurrency(pkg.price)}`}
                >
                  {formatCurrency(pkg.price)}
                </span>
              </div>

              <p className="line-clamp-2 text-xs text-[#5c4a45]">
                {pkg.description}
              </p>

              {/* Package Info */}
              <div
                className="text-xs text-[#5c4a45]"
                aria-label={`Package contains ${pkg.includedItems.reduce((total, item) => total + item.quantity, 0)} items`}
              >
                {pkg.includedItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}{' '}
                items included
              </div>

              {/* Quick Add Button */}
              <Button
                onClick={e => handleQuickAdd(pkg, e)}
                disabled={!pkg.isActive}
                size="sm"
                className={`mt-auto flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                  pkg.isActive
                    ? 'border border-[#f2330d] bg-white text-[#f2330d] hover:bg-[#f2330d] hover:text-white'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
                variant={pkg.isActive ? 'outline' : 'secondary'}
                aria-label={
                  pkg.isActive
                    ? `View ${pkg.name} package details`
                    : `${pkg.name} package is currently unavailable`
                }
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                {pkg.isActive ? 'View Package' : 'Unavailable'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
