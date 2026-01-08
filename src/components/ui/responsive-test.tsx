'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

const ResponsiveTest = () => {
  return (
    <ResponsiveContainer variant="constrained" className="py-8">
      <div className="space-y-8">
        {/* Breakpoint Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS 4 Responsive Design System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Mobile First (320px+)
              </Badge>
              <Badge variant="outline" className="hidden sm:inline-flex">
                SM (640px+)
              </Badge>
              <Badge variant="outline" className="hidden md:inline-flex">
                MD (768px+)
              </Badge>
              <Badge variant="outline" className="hidden lg:inline-flex">
                LG (1024px+)
              </Badge>
              <Badge variant="outline" className="hidden xl:inline-flex">
                XL (1280px+)
              </Badge>
              <Badge variant="outline" className="hidden 2xl:inline-flex">
                2XL (1400px+)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Grid Test - Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items Grid (Custom CSS Classes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid variant="menu-items">
              {Array.from({ length: 8 }, (_, i) => (
                <Card key={i} className="h-32">
                  <CardContent className="p-4">
                    <div className="text-muted-foreground text-sm">
                      Menu Item {i + 1}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Responsive Grid Test - Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Packages Grid (Custom CSS Classes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid variant="packages">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="h-40">
                  <CardContent className="p-4">
                    <div className="text-muted-foreground text-sm">
                      Package {i + 1}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Responsive Grid Test - Admin Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Cards Grid (Custom CSS Classes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid variant="admin-cards">
              {Array.from({ length: 8 }, (_, i) => (
                <Card key={i} className="h-24">
                  <CardContent className="p-4">
                    <div className="text-muted-foreground text-sm">
                      Admin Card {i + 1}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Custom Animations Test */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Animations (Tailwind CSS 4)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-slide-in-right rounded bg-blue-100 p-4 text-blue-800">
              Slide in from right animation
            </div>
            <div className="animate-scale-in rounded bg-green-100 p-4 text-green-800">
              Scale in animation
            </div>
            <div className="animate-bounce-subtle rounded bg-purple-100 p-4 text-purple-800">
              Subtle bounce animation
            </div>
          </CardContent>
        </Card>

        {/* Responsive Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              Responsive Heading
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              This paragraph adjusts its size based on screen size. On mobile
              it's smaller, on tablet it's medium, and on desktop it's larger.
            </p>
          </CardContent>
        </Card>

        {/* Responsive Spacing */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Spacing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-8">
              <div className="bg-muted rounded p-2 sm:p-4 md:p-6 lg:p-8">
                <div className="text-sm">Responsive padding and spacing</div>
              </div>
              <div className="bg-muted rounded p-2 sm:p-4 md:p-6 lg:p-8">
                <div className="text-sm">Adjusts based on screen size</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="block rounded bg-red-100 p-4 text-red-800 sm:hidden">
                Only visible on mobile (xs)
              </div>
              <div className="hidden rounded bg-blue-100 p-4 text-blue-800 sm:block md:hidden">
                Only visible on small screens (sm)
              </div>
              <div className="hidden rounded bg-green-100 p-4 text-green-800 md:block lg:hidden">
                Only visible on medium screens (md)
              </div>
              <div className="hidden rounded bg-yellow-100 p-4 text-yellow-800 lg:block xl:hidden">
                Only visible on large screens (lg)
              </div>
              <div className="hidden rounded bg-purple-100 p-4 text-purple-800 xl:block">
                Only visible on extra large screens (xl+)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export { ResponsiveTest };
