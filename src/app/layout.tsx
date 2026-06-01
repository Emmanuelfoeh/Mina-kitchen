import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ConditionalNav } from '@/components/navigation/conditional-nav';
import { ConditionalFooter } from '@/components/navigation/conditional-footer';
import { NavigationTracker } from '@/components/navigation/navigation-tracker';
import { ConditionalCartSidebar } from '@/components/cart';
import { SkipLink } from '@/components/ui/skip-link';
// import { ContrastChecker } from '@/components/ui/contrast-checker';
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider';
import {
  AnalyticsProvider,
  AnalyticsScript,
} from '@/components/analytics/analytics-provider';
// import { AnalyticsDebugPanel } from '@/components/analytics/analytics-debug-panel';
import {
  generateMetadata as buildMetadata,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from '@/lib/metadata';
import { getRequestBaseUrl } from '@/lib/tenant-metadata';
import { QueryProvider } from '@/components/providers/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { TenantProvider } from '@/components/tenant/tenant-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  // Resolve the tenant's own host so canonical/OG/metadataBase are correct
  // per tenant instead of all pointing at a single hardcoded domain.
  const baseUrl = await getRequestBaseUrl();
  return buildMetadata({
    title: 'Mina Kitchen - Authentic African Cuisine in Toronto',
    description:
      'Order authentic West African dishes online. Experience traditional Jollof rice, Egusi soup, Suya, and more. Fresh ingredients, bold flavors, delivered to your door in Toronto and GTA.',
    keywords: [
      'African food Toronto',
      'West African cuisine',
      'Jollof rice delivery',
      'Nigerian food Toronto',
      'Ghanaian food',
      'African restaurant',
      'Egusi soup',
      'Suya Toronto',
      'authentic African food',
      'food delivery Toronto',
      'meal packages',
      'African catering',
    ],
    url: '/',
    type: 'website',
    baseUrl,
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        <AnalyticsScript />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <AccessibilityProvider>
          <QueryProvider>
            <TenantProvider>
              <ErrorBoundary>
                <AnalyticsProvider>
                  <AuthProvider>
                    <NavigationTracker />
                    <ConditionalNav />
                    <main id="main-content" tabIndex={-1}>
                      {children}
                    </main>
                    <ConditionalFooter />
                    <ConditionalCartSidebar />
                    <Toaster position="top-right" />
                    {/* <AnalyticsDebugPanel /> */}
                    {/* <ContrastChecker /> */}
                  </AuthProvider>
                </AnalyticsProvider>
              </ErrorBoundary>
            </TenantProvider>
          </QueryProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
