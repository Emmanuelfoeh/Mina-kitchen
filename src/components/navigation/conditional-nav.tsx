'use client';

import { usePathname } from 'next/navigation';
import { MainNav } from './main-nav';

export function ConditionalNav() {
  const pathname = usePathname();

  // Don't show main nav on admin pages (they have their own header)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <MainNav />;
}
