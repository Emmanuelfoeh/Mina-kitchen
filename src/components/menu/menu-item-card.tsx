'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Flame, Leaf } from 'lucide-react';
import { formatCurrency } from '@/utils';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  menuItem: MenuItem;
  onCustomizeClick: () => void;
  onQuickAdd?: () => void;
}

export function MenuItemCard({
  menuItem,
  onCustomizeClick,
  onQuickAdd,
}: MenuItemCardProps) {
  const getStatusBadge = () => {
    switch (menuItem.status) {
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

  const getSpicyIndicator = () => {
    if (menuItem.tags.includes('spicy') || menuItem.tags.includes('hot')) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <Flame className="h-4 w-4" />
          <span className="text-xs font-medium">Spicy</span>
        </div>
      );
    }
    return null;
  };

  const getVegetarianIndicator = () => {
    if (
      menuItem.tags.includes('vegetarian') ||
      menuItem.tags.includes('vegan')
    ) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <Leaf className="h-4 w-4" />
          <span className="text-xs font-medium">Vegetarian</span>
        </div>
      );
    }
    return null;
  };

  const isAvailable =
    menuItem.status === 'active' || menuItem.status === 'low_stock';

  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-white transition-all duration-300 hover:border-[#f2330d]/20 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="h-full w-full bg-gray-200 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url('${menuItem.image}')`,
          }}
        />

        {/* Status Badge */}
        {getStatusBadge() && (
          <div className="absolute top-3 right-3">{getStatusBadge()}</div>
        )}

        {/* Dietary Indicators */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {getSpicyIndicator()}
          {getVegetarianIndicator()}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-2 text-lg leading-tight font-bold text-[#1c100d]">
            {menuItem.name}
          </h3>
          <span className="ml-2 text-lg font-bold text-[#f2330d]">
            {formatCurrency(menuItem.basePrice)}
          </span>
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-[#5c4a45]">
          {menuItem.description}
        </p>

        {/* Customization Options Preview */}
        {menuItem.customizations.length > 0 && (
          <div className="text-xs text-[#5c4a45]">
            <span className="font-medium">Customizable:</span>{' '}
            {menuItem.customizations
              .slice(0, 2)
              .map(c => c.name)
              .join(', ')}
            {menuItem.customizations.length > 2 &&
              ` +${menuItem.customizations.length - 2} more`}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          {/* Main Action Button */}
          <Button
            onClick={onCustomizeClick}
            disabled={!isAvailable}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-colors ${
              isAvailable
                ? 'border border-[#f2330d] bg-white text-[#f2330d] hover:bg-[#f2330d] hover:text-white'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
            variant={isAvailable ? 'outline' : 'secondary'}
          >
            <Plus className="text-[18px]" />
            {isAvailable
              ? menuItem.customizations.length > 0
                ? 'Customize & Add'
                : 'Add to Cart'
              : 'Unavailable'}
          </Button>

          {/* Quick Add Button - Only show if item has no required customizations and onQuickAdd is provided */}
          {isAvailable &&
            onQuickAdd &&
            menuItem.customizations.length > 0 &&
            !menuItem.customizations.some(c => c.required) && (
              <Button
                onClick={onQuickAdd}
                className="w-full bg-[#f2330d] py-1.5 text-xs text-white hover:bg-[#d12b0a]"
                size="sm"
              >
                Quick Add - {formatCurrency(menuItem.basePrice)}
              </Button>
            )}
        </div>
      </div>
    </Card>
  );
}
