'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import type { MenuCategory } from '@/types';

interface MenuFiltersProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MenuFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: MenuFiltersProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Category Pills - Horizontal scrollable */}
      <div className="scrollbar-hide overflow-x-auto">
        <div className="flex gap-3 pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
            className={
              selectedCategory === 'all'
                ? 'h-9 shrink-0 rounded-full bg-[#f2330d] px-5 text-white shadow-md shadow-[#f2330d]/25 transition-transform active:scale-95'
                : 'h-9 shrink-0 rounded-full border border-[#e6dbd9] bg-white px-5 text-sm font-medium text-[#1c100d] transition-all hover:border-[#f2330d]/50 hover:text-[#f2330d] active:scale-95'
            }
          >
            All Menu
          </Button>

          {displayedCategories.map(category => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.name ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => onCategoryChange(category.name)}
              className={
                selectedCategory === category.name
                  ? 'h-9 shrink-0 rounded-full bg-[#f2330d] px-5 text-white shadow-md shadow-[#f2330d]/25 transition-transform active:scale-95'
                  : 'h-9 shrink-0 rounded-full border border-[#e6dbd9] bg-white px-5 text-sm font-medium text-[#1c100d] transition-all hover:border-[#f2330d]/50 hover:text-[#f2330d] active:scale-95'
              }
            >
              {category.name}
            </Button>
          ))}

          {categories.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="shrink-0 text-[#f2330d] hover:bg-[#f2330d]/5"
            >
              {showAllCategories
                ? 'Show Less'
                : `+${categories.length - 5} More`}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory !== 'all' || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#5c4a45]">Active filters:</span>

          {selectedCategory !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer bg-[#f2330d]/10 text-[#f2330d] hover:bg-[#f2330d]/20"
              onClick={() => onCategoryChange('all')}
            >
              {selectedCategory} ×
            </Badge>
          )}

          {searchQuery && (
            <Badge
              variant="secondary"
              className="cursor-pointer bg-[#f2330d]/10 text-[#f2330d] hover:bg-[#f2330d]/20"
              onClick={() => onSearchChange('')}
            >
              "{searchQuery}" ×
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryChange('all');
              onSearchChange('');
            }}
            className="text-xs text-[#5c4a45] hover:text-[#f2330d]"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Search Bar - Only show when there's a search query or when not on 'all' */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-[#5c4a45]" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="h-10 border-[#e6dbd9] pl-10 focus:border-[#f2330d] focus:ring-[#f2330d]/20"
          />
        </div>
      )}
    </div>
  );
}
