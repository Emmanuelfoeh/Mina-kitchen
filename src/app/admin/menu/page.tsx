import { Suspense } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuItemsTable } from '@/components/admin/menu/menu-items-table';
import { MenuItemsGrid } from '@/components/admin/menu/menu-items-grid';
import { MenuStats } from '@/components/admin/menu/menu-stats';
import Link from 'next/link';

export default function MenuManagementPage() {
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
              <Input placeholder="Search menu items..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="main-dishes">Main Dishes</SelectItem>
                <SelectItem value="soups">Soups</SelectItem>
                <SelectItem value="sides">Sides</SelectItem>
                <SelectItem value="starters">Starters</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="sold_out">Sold Out</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items Display */}
          <Suspense fallback={<div>Loading menu items...</div>}>
            <MenuItemsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
