import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuItemForm } from '@/components/admin/menu/menu-item-form';
import { db } from '@/lib/db';
import Link from 'next/link';

interface EditMenuItemPageProps {
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

export default async function EditMenuItemPage({
  params,
}: EditMenuItemPageProps) {
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

  // Transform the data to match the form interface
  const menuItem = {
    ...rawMenuItem,
    tags: rawMenuItem.tags ? JSON.parse(rawMenuItem.tags) : [],
    allergens: rawMenuItem.allergens || [],
    preparationTime: rawMenuItem.preparationTime || undefined,
    chefNotes: rawMenuItem.chefNotes || undefined,
    seoTitle: rawMenuItem.seoTitle || undefined,
    seoDescription: rawMenuItem.seoDescription || undefined,
    status: rawMenuItem.status as
      | 'ACTIVE'
      | 'INACTIVE'
      | 'SOLD_OUT'
      | 'LOW_STOCK',
    customizations: rawMenuItem.customizations.map(customization => ({
      ...customization,
      type: customization.type.toLowerCase() as 'radio' | 'checkbox' | 'text',
      maxSelections: customization.maxSelections || undefined,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/menu">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Menu Item</h1>
          <p className="text-gray-500">Update {menuItem.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemForm initialData={menuItem} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}
