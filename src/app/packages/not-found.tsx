'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function PackageNotFound() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/packages' },
    { label: 'Package Not Found' },
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
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <Package className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Package Not Found
            </h1>
            <p className="text-lg text-gray-600">
              The meal package you're looking for doesn't exist or may no longer
              be available.
            </p>
          </div>

          {/* Action Cards */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Browse All Packages
                </h3>
                <p className="mb-4 text-gray-600">
                  Explore our current meal packages and find great deals on
                  curated combinations.
                </p>
                <Button asChild className="w-full">
                  <Link href="/packages" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    View All Packages
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Individual Items
                </h3>
                <p className="mb-4 text-gray-600">
                  Browse our full menu to create your own custom meal
                  combination.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/menu" className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Browse Menu
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Package Types */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Popular Package Types
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/packages?type=family">Family Packages</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/packages?type=individual">
                  Individual Packages
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/packages?type=party">Party Packages</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/packages?type=lunch">Lunch Specials</Link>
              </Button>
            </div>
          </div>

          {/* Value Proposition */}
          <Card className="mb-8 bg-green-50">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-green-800">
                Why Choose Our Packages?
              </h3>
              <p className="text-green-700">
                Our meal packages offer great value with carefully curated
                combinations that save you money while providing a complete
                dining experience.
              </p>
            </CardContent>
          </Card>

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
