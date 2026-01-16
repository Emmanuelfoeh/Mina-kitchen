'use client';

import Link from 'next/link';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <Link
      href={href}
      className="sr-only transition-all focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-orange-600 focus:px-4 focus:py-2 focus:font-medium focus:text-white focus:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
    >
      {children}
    </Link>
  );
}
