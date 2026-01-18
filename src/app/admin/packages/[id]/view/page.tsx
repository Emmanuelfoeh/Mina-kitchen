import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Package as PackageIcon,
  DollarSign,
  Clock,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import type { Package } from '@/types';

interface ViewPackagePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ViewPackagePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `View Package ${id} - Admin Dashboard`,
    description: 'View package details and configuration',
  };
}

export default async function ViewPackagePage({
  params,
}: ViewPackagePageProps) {
  const { id } = await params;

  // Get cookies for authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  // Fetch package data with authentication
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/packages/${id}`,
    {
      cache: 'no-store',
      headers: {
        Cookie: `auth-token=${authToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    notFound();
  }

  const { data: packageData } = (await response.json()) as { data: Package };

  const getTypeBadge = (type: Package['type']) => {
    const colors = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/packages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Packages
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {packageData.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Package details and configuration
            </p>
          </div>
        </div>
        <Link href={`/admin/packages/${packageData.id}`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Package
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Package Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Package Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {packageData.image ? (
                  <img
                    src={packageData.image}
                    alt={packageData.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                    <PackageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{packageData.name}</h3>
                  <p className="mt-1 text-gray-600">
                    {packageData.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {getTypeBadge(packageData.type)}
                    {getStatusBadge(packageData.isActive)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Features */}
          {packageData.features && packageData.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Package Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {packageData.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Included Items */}
          {packageData.includedItems &&
            packageData.includedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Included Menu Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {packageData.includedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            Menu Item ID: {item.menuItemId}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                          {item.includedCustomizations &&
                            item.includedCustomizations.length > 0 && (
                              <div className="mt-1 text-sm text-gray-600">
                                <span className="font-medium">
                                  Included Customizations:
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {item.includedCustomizations.map(
                                    (customization, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {customization}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <Badge variant="secondary">Qty: {item.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* SEO Information */}
          {(packageData.seoTitle || packageData.seoDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {packageData.seoTitle && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      SEO Title
                    </label>
                    <p className="mt-1 text-gray-900">{packageData.seoTitle}</p>
                  </div>
                )}
                {packageData.seoDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      SEO Description
                    </label>
                    <p className="mt-1 text-gray-900">
                      {packageData.seoDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Package Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price</span>
                <span className="text-2xl font-bold text-green-600">
                  ${packageData.price.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium">
                  {packageData.type.charAt(0).toUpperCase() +
                    packageData.type.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(packageData.isActive)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Items</span>
                <span className="font-medium">
                  {packageData.includedItems?.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  ) || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Package Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Package ID
                </label>
                <p className="mt-1 font-mono text-sm text-gray-900">
                  {packageData.id}
                </p>
              </div>
              {(packageData as any).createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(
                      (packageData as any).createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              {(packageData as any).updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(
                      (packageData as any).updatedAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/admin/packages/${packageData.id}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Package
                </Button>
              </Link>
              <Link
                href={`/packages/${packageData.slug || packageData.id}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  View as Customer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
