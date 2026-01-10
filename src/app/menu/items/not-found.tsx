'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function MenuItemNotFound() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Item Not Found' },
  ];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
              <Utensils className="h-12 w-12 text-orange-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Menu Item Not Found
            </h1>
            <p className="text-lg text-gray-600">
              The menu item you're looking for doesn't exist or may have been
              removed from our menu.
            </p>
          </div>

          {/* Action Cards */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Browse Our Menu
                </h3>
                <p className="mb-4 text-gray-600">
                  Discover all our delicious African dishes and find something
                  new to try.
                </p>
                <Button asChild className="w-full">
                  <Link href="/menu" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    View Full Menu
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Try Our Packages
                </h3>
                <p className="mb-4 text-gray-600">
                  Explore our curated meal packages for great value and variety.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/packages" className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    View Packages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Popular Categories */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Popular Categories
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/menu?category=mains">Main Dishes</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/menu?category=appetizers">Appetizers</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/menu?category=desserts">Desserts</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/menu?category=beverages">Beverages</Link>
              </Button>
            </div>
          </div>

          {/* Back Navigation */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
