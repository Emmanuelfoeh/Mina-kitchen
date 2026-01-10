'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Clock, Users, Star, CheckCircle } from 'lucide-react';
import type { Package, MenuItem } from '@/types';

interface PackageCardProps {
  package: Package;
  menuItems: MenuItem[];
  onSelect: () => void;
}

export function PackageCard({
  package: pkg,
  menuItems,
  onSelect,
}: PackageCardProps) {
  // Calculate total items and savings
  const totalItems = pkg.includedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const individualPrice = pkg.includedItems.reduce((sum, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    return sum + (menuItem?.basePrice || 0) * item.quantity;
  }, 0);
  const savings = individualPrice - pkg.price;
  const savingsPercentage = Math.round((savings / individualPrice) * 100);

  // Get package type styling
  const getPackageTypeStyle = (type: Package['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'weekly':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'monthly':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get duration info
  const getDurationInfo = (type: Package['type']) => {
    switch (type) {
      case 'daily':
        return { duration: '1 Day', icon: Clock };
      case 'weekly':
        return { duration: '7 Days', icon: Users };
      case 'monthly':
        return { duration: '30 Days', icon: Star };
      default:
        return { duration: '1 Day', icon: Clock };
    }
  };

  const { duration, icon: DurationIcon } = getDurationInfo(pkg.type);

  return (
    <Card className="group overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Package Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getPackageTypeStyle(pkg.type)} font-semibold`}>
            {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}
          </Badge>
        </div>
        {savings > 0 && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-500 font-semibold text-white">
              Save {savingsPercentage}%
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
            {pkg.name}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <DurationIcon className="mr-1 h-4 w-4" />
            {duration}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          {pkg.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Package Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-orange-50 p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalItems}
            </div>
            <div className="text-xs text-gray-600">Total Items</div>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${pkg.price}
            </div>
            <div className="text-xs text-gray-600">Package Price</div>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">
            Package Includes:
          </h4>
          <div className="space-y-1">
            {pkg.features.slice(0, 3).map((feature, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-gray-600"
              >
                <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                {feature}
              </div>
            ))}
            {pkg.features.length > 3 && (
              <div className="text-sm font-medium text-orange-600">
                +{pkg.features.length - 3} more features
              </div>
            )}
          </div>
        </div>

        {/* Savings Display */}
        {savings > 0 && (
          <div className="rounded-lg border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-3">
            <div className="text-sm text-gray-600">
              Individual price:{' '}
              <span className="line-through">
                ${individualPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-sm font-semibold text-red-600">
              You save: ${savings.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={onSelect}
          className="w-full transform rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-red-600"
        >
          Customize & Select Package
        </Button>
      </CardFooter>
    </Card>
  );
}
