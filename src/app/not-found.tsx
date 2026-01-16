'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSuggestedUrls } from '@/lib/redirects';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [suggestedUrls, setSuggestedUrls] = useState<
    Array<{ href: string; label: string }>
  >([]);

  useEffect(() => {
    // Get suggested URLs based on the current path
    const urls = getSuggestedUrls(window.location.pathname);
    setSuggestedUrls(urls);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl text-center">
        {/* 404 Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-6xl font-bold text-gray-900 sm:text-8xl">
            404
          </h1>
          <h2 className="mb-4 text-2xl font-semibold text-gray-700 sm:text-3xl">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for. The item or
            page may have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Navigation Options */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              What would you like to do?
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button asChild variant="default" className="h-auto p-4">
                <Link href="/" className="flex flex-col items-center gap-2">
                  <Home className="h-6 w-6" />
                  <span className="font-medium">Go Home</span>
                  <span className="text-sm opacity-90">
                    Return to the homepage
                  </span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/menu" className="flex flex-col items-center gap-2">
                  <Search className="h-6 w-6" />
                  <span className="font-medium">Browse Menu</span>
                  <span className="text-sm opacity-90">
                    Explore our food options
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Suggested Pages
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedUrls.slice(0, 6).map((suggestion, index) => (
              <Button key={index} asChild variant="ghost" size="sm">
                <Link href={suggestion.href}>{suggestion.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <Link
              href="/contact"
              className="text-orange-600 underline hover:text-orange-700"
            >
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
