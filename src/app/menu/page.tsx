import { Suspense } from 'react';
import { Metadata } from 'next';
import { MenuBrowser } from '@/components/menu/menu-browser';
import { MenuSkeleton } from '@/components/menu/menu-skeleton';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Menu - Authentic African Dishes',
  description:
    'Browse our full menu of authentic West African dishes. From smokey Jollof rice to rich Egusi soup, tender Suya, and traditional sides. Order online for delivery in Toronto and GTA.',
  keywords: [
    'African menu Toronto',
    'Jollof rice menu',
    'Egusi soup order',
    'Suya delivery',
    'West African dishes',
    'Nigerian food menu',
    'Ghanaian cuisine',
    'African restaurant menu',
    'authentic African food',
    'plantain dishes',
    'African soups',
    'rice dishes',
  ],
  url: '/menu',
  type: 'website',
});

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      {/* Hero Section */}
      <div className="bg-surface-dark relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden p-6 text-center shadow-xl md:min-h-[360px] md:p-12">
        {/* Background with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`,
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        <div className="absolute inset-0 z-10 bg-[#f2330d]/20 mix-blend-multiply" />

        {/* Content */}
        <div className="relative z-20 flex max-w-2xl flex-col gap-4 md:gap-6">
          <span className="mx-auto inline-block w-fit rounded-full bg-[#f2330d]/90 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm">
            NEW SEASON MENU
          </span>
          <h1 className="text-3xl leading-tight font-black tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
            Taste the Soul of <span className="text-[#f2330d]">Africa</span>
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed font-medium text-gray-200 drop-shadow-sm md:text-lg">
            From smokey Jollof to tender Suya, experience authentic West African
            flavors crafted with passion and delivered fresh to your door.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-10">
        <Suspense fallback={<MenuSkeleton />}>
          <MenuBrowser />
        </Suspense>
      </div>
    </div>
  );
}
