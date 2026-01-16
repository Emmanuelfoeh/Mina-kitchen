'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react';
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
import { mockMenuItems, mockCategories } from '@/lib/mock-data';
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

export function MenuItemsTable() {
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems);

  const handleStatusChange = async (
    itemId: string,
    newStatus: MenuItem['status']
  ) => {
    try {
      const response = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
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
      alert(error instanceof Error ? error.message : 'Failed to update status');
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
        // Remove from local state
        setItems(prev => prev.filter(item => item.id !== itemId));
        alert('Menu item deleted successfully');
      } else {
        throw new Error(result.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to delete menu item'
      );
    }
  };

  const handleDuplicate = (item: MenuItem) => {
    const duplicatedItem: MenuItem = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => [duplicatedItem, ...prev]);
  };

  return (
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
          {items.map(item => (
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
                  variant="secondary"
                >
                  {statusLabels[item.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex max-w-32 flex-wrap gap-1">
                  {item.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 2}
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
                    <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/menu/items/${item.slug || item.id}`}
                        target="_blank"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View on Customer Site
                      </Link>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
