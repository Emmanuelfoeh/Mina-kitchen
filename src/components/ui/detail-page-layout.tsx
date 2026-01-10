import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb';
import { BackButton } from './back-button';

interface DetailPageLayoutProps {
  breadcrumbItems: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  backButtonFallback?: string;
}

export function DetailPageLayout({
  breadcrumbItems,
  children,
  className = '',
  showBackButton = true,
  backButtonFallback = '/',
}: DetailPageLayoutProps) {
  return (
    <div className={`container-responsive py-4 sm:py-6 lg:py-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          Skip to main content
        </a>

        {/* Back Button - Mobile friendly */}
        {showBackButton && (
          <div className="mb-3 sm:mb-4">
            <BackButton
              fallbackUrl={backButtonFallback}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            />
          </div>
        )}

        {/* Breadcrumb Navigation - Responsive spacing */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

        {/* Main Content */}
        <main id="main-content" role="main" aria-label="Product details">
          {children}
        </main>
      </div>
    </div>
  );
}

interface DetailPageGridProps {
  gallery: React.ReactNode;
  information: React.ReactNode;
  className?: string;
}

export function DetailPageGrid({
  gallery,
  information,
  className = '',
}: DetailPageGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 ${className}`}
      role="region"
      aria-label="Product details"
    >
      {/* Product Gallery - Left on desktop, top on mobile */}
      <section
        className="order-1 lg:sticky lg:top-4 lg:self-start"
        aria-label="Product images"
      >
        {gallery}
      </section>

      {/* Product Information - Right on desktop, bottom on mobile */}
      <section
        className="order-2 space-y-4 sm:space-y-6"
        aria-label="Product information and customization"
      >
        {information}
      </section>
    </div>
  );
}

interface DetailPageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailPageSection({
  title,
  children,
  className = '',
}: DetailPageSectionProps) {
  return (
    <section className={`mt-8 sm:mt-12 lg:mt-16 ${className}`}>
      {title && (
        <h2
          className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl lg:text-3xl"
          id={title.toLowerCase().replace(/\s+/g, '-')}
        >
          {title}
        </h2>
      )}
      <div
        role="region"
        aria-labelledby={
          title ? title.toLowerCase().replace(/\s+/g, '-') : undefined
        }
      >
        {children}
      </div>
    </section>
  );
}

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'wide';
  className?: string;
}

export function ResponsiveCardGrid({
  children,
  variant = 'default',
  className = '',
}: ResponsiveCardGridProps) {
  const gridClasses = {
    default: 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3',
    compact:
      'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4',
    wide: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8',
  };

  return (
    <div className={`${gridClasses[variant]} ${className}`}>{children}</div>
  );
}

interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileStack({ children, className = '' }: MobileStackProps) {
  return (
    <div className={`flex flex-col space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </div>
  );
}
