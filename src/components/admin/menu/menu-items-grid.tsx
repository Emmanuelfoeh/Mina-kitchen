'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MenuItem } from '@/types';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  sold_out: 'bg-red-100 text-red-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  sold_out: 'Sold Out',
  low_stock: 'Low Stock',
};

export function MenuItemsGrid() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/menu/items');
      const result = await response.json();

      if (result.success) {
        setItems(result.data);
      } else {
        setError('Failed to load menu items');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    itemId: string,
    newStatus: MenuItem['status']
  ) => {
    try {
      const response = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        );
      } else {
        console.error('Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        const response = await fetch(`/api/admin/menu/items/${itemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setItems(prev => prev.filter(item => item.id !== itemId));
        } else {
          console.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleDuplicate = async (item: MenuItem) => {
    try {
      const duplicatedItem = {
        ...item,
        name: `${item.name} (Copy)`,
        slug: undefined, // Let the API generate a new slug
      };

      const response = await fetch('/api/admin/menu/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedItem),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setItems(prev => [result.data, ...prev]);
        }
      } else {
        console.error('Failed to duplicate item');
      }
    } catch (error) {
      console.error('Error duplicating item:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative aspect-video animate-pulse bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-red-600">{error}</p>
        <Button onClick={fetchMenuItems} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-gray-500">No menu items found.</p>
        <Link href="/admin/menu/new">
          <Button>Add First Menu Item</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <Card key={item.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/menu/items/${item.slug || item.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/menu/${item.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="absolute top-2 left-2">
              <Badge className={statusColors[item.status]} variant="secondary">
                {statusLabels[item.status]}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="line-clamp-2 text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  ${item.basePrice.toFixed(2)}
                </span>
                <Badge variant="outline">{item.category.name}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
