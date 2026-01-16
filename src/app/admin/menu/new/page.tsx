import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuItemForm } from '@/components/admin/menu/menu-item-form';
import Link from 'next/link';

export default function NewMenuItemPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Menu Item
          </h1>
          <p className="text-gray-500">Create a new dish for your menu</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemForm />
        </CardContent>
      </Card>
    </div>
  );
}
