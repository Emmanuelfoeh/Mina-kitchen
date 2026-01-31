'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'LOW_STOCK';
  tags: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MenuItemsResponse {
  items: MenuItemData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface MenuItemsTableProps {
  searchTerm?: string;
  categoryFilter?: string;
  statusFilter?: string;
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  SOLD_OUT: 'bg-red-100 text-red-800 border-red-200',
  LOW_STOCK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SOLD_OUT: 'Sold Out',
  LOW_STOCK: 'Low Stock',
};

export function MenuItemsTable({
  searchTerm = '',
  categoryFilter = 'all',
  statusFilter = 'all',
}: MenuItemsTableProps) {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [pagination, setPagination] = useState<
    MenuItemsResponse['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        categoryId: categoryFilter,
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/menu/items?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.data.items);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleStatusChange = async (
    itemId: string,
    newStatus: MenuItemData['status']
  ) => {
    try {
      const response = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local state
        setItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update status'
      );
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the list
        fetchMenuItems();
        toast.success('Menu item deleted successfully');
      } else {
        throw new Error(result.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete menu item'
      );
    }
  };

  const handleDuplicate = async (item: MenuItemData) => {
    try {
      const response = await fetch('/api/admin/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${item.name} (Copy)`,
          description: item.description,
          basePrice: item.basePrice,
          categoryId: item.category.id,
          status: 'INACTIVE', // Set as inactive by default
          image: item.image,
          tags: JSON.parse(item.tags || '[]'),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the list
        fetchMenuItems();
        toast.success('Menu item duplicated successfully');
      } else {
        throw new Error(result.error || 'Failed to duplicate menu item');
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to duplicate menu item'
      );
    }
  };

  const parseTags = (tagsString: string): string[] => {
    try {
      return JSON.parse(tagsString || '[]');
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 p-4"
          >
            <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map(item => {
                const tags = parseTags(item.tags);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="max-w-xs truncate text-sm text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${item.basePrice.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={statusColors[item.status]}
                        variant="outline"
                      >
                        {statusLabels[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-32 flex-wrap gap-1">
                        {tags.slice(0, 2).map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/menu/${item.id}/view`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/menu/${item.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(
                                item.id,
                                item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                              )
                            }
                          >
                            {item.status === 'ACTIVE'
                              ? 'Deactivate'
                              : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No menu items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}{' '}
            of {pagination.totalCount} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
