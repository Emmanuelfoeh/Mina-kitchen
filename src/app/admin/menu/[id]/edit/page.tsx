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

export default async function EditMenuItemPage({
  params,
}: EditMenuItemPageProps) {
  const { id } = await params;

  // Fetch the menu item from database
  const menuItem = await db.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!menuItem) {
    notFound();
  }

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
