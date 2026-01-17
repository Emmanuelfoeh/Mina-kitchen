'use client';

import { Suspense, useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuItemsTable } from '@/components/admin/menu/menu-items-table';
import { MenuStats } from '@/components/admin/menu/menu-stats';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';

interface MenuCategory {
  id: string;
  name: string;
}

export default function MenuManagementPage() {
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  // Debounce search input to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    // Fetch categories for the filter dropdown
    async function fetchCategories() {
      try {
        const response = await fetch('/api/admin/menu/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-1 text-gray-500">
            Manage your menu items, categories, and pricing
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/menu/categories">
            <Button variant="outline" className="gap-2 bg-white">
              <Filter className="h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Link href="/admin/menu/new">
            <Button className="gap-2 bg-[#f97316] text-white hover:bg-[#ea580c]">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Menu Statistics */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <MenuStats />
      </Suspense>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search menu items..."
                className="pl-10"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items Display */}
          <Suspense fallback={<div>Loading menu items...</div>}>
            <MenuItemsTable
              searchTerm={debouncedSearchTerm}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
