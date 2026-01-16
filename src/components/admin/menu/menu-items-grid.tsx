'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react';
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
import { mockMenuItems } from '@/lib/mock-data';
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
  const [items, setItems] = useState<MenuItem[]>(mockMenuItems);

  const handleStatusChange = (
    itemId: string,
    newStatus: MenuItem['status']
  ) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
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
