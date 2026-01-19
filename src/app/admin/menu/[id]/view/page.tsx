import { notFound } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteMenuItemButton } from '@/components/admin/menu/delete-menu-item-button';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';

interface ViewMenuItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Type for the database result with relations
type MenuItemWithRelations = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  status: string;
  tags: string;
  chefNotes: string | null;
  preparationTime: number | null;
  allergens: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category: {
    id: string;
    name: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  };
  customizations: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    maxSelections: number | null;
    options: Array<{
      id: string;
      name: string;
      priceModifier: number;
      isAvailable: boolean;
    }>;
  }>;
};

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

export default async function ViewMenuItemPage({
  params,
}: ViewMenuItemPageProps) {
  const { id } = await params;

  // Fetch the menu item from database
  const rawMenuItem: MenuItemWithRelations | null =
    await db.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        customizations: {
          include: {
            options: true,
          },
        },
      },
    });

  if (!rawMenuItem) {
    notFound();
  }

  // Transform the data to ensure proper typing
  const menuItem = {
    ...rawMenuItem,
    status: rawMenuItem.status as
      | 'ACTIVE'
      | 'INACTIVE'
      | 'SOLD_OUT'
      | 'LOW_STOCK',
  };

  // Parse tags from JSON string
  const tags = JSON.parse(menuItem.tags || '[]');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/menu">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItem.name}
            </h1>
            <p className="text-gray-500">Menu Item Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/menu/${menuItem.id}/edit`}>
            <Button className="gap-2 bg-[#f97316] hover:bg-[#ea580c]">
              <Edit className="h-4 w-4" />
              Edit Item
            </Button>
          </Link>
          <DeleteMenuItemButton itemId={menuItem.id} itemName={menuItem.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={menuItem.image}
                  alt={menuItem.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-lg font-semibold">{menuItem.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <Badge variant="outline" className="mt-1">
                    {menuItem.category.name}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Base Price
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    ${menuItem.basePrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge
                    className={statusColors[menuItem.status]}
                    variant="outline"
                  >
                    {statusLabels[menuItem.status]}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-gray-700">{menuItem.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="font-medium">
                  {new Date(menuItem.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-medium">
                  {new Date(menuItem.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customizations */}
          {menuItem.customizations && menuItem.customizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Customizations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuItem.customizations.map(customization => (
                  <div key={customization.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium">{customization.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{customization.type}</Badge>
                        {customization.required && (
                          <Badge variant="secondary">Required</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {customization.options.map(option => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <span className="text-sm">{option.name}</span>
                          <div className="flex items-center gap-2">
                            {option.priceModifier !== 0 && (
                              <span className="text-sm font-medium">
                                {option.priceModifier > 0 ? '+' : ''}$
                                {option.priceModifier.toFixed(2)}
                              </span>
                            )}
                            <Badge
                              variant={
                                option.isAvailable ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {option.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
