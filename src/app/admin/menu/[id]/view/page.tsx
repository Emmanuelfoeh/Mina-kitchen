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
  const menuItem = await db.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
      customizations: {
        include: {
          options: true,
        },
      },
      nutritionalInfo: true,
    },
  });

  if (!menuItem) {
    notFound();
  }

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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutritional Information */}
          {menuItem.nutritionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Calories</span>
                  <span className="font-medium">
                    {menuItem.nutritionalInfo.calories}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Protein</span>
                  <span className="font-medium">
                    {menuItem.nutritionalInfo.protein}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Carbs</span>
                  <span className="font-medium">
                    {menuItem.nutritionalInfo.carbs}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fat</span>
                  <span className="font-medium">
                    {menuItem.nutritionalInfo.fat}g
                  </span>
                </div>
                {menuItem.nutritionalInfo.fiber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fiber</span>
                    <span className="font-medium">
                      {menuItem.nutritionalInfo.fiber}g
                    </span>
                  </div>
                )}
                {menuItem.nutritionalInfo.sodium && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sodium</span>
                    <span className="font-medium">
                      {menuItem.nutritionalInfo.sodium}mg
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/menu/items/${menuItem.id}`} target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  View on Customer Site
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                Duplicate Item
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Order History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
