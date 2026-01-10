import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-provider';
import { MainNav } from '@/components/navigation/main-nav';
import { NavigationTracker } from '@/components/navigation/navigation-tracker';
import { CartSidebar } from '@/components/cart';
import {
  AnalyticsProvider,
  AnalyticsScript,
} from '@/components/analytics/analytics-provider';
import { AnalyticsDebugPanel } from '@/components/analytics/analytics-debug-panel';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mina Kitchen - Authentic African Cuisine',
  description: 'Order authentic West African dishes online',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <AnalyticsScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsProvider>
          <AuthProvider>
            <NavigationTracker />
            <MainNav />
            {children}
            <CartSidebar />
            <AnalyticsDebugPanel />
          </AuthProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
