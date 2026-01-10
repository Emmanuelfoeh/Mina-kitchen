import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle URL redirects and validation
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Handle common redirect patterns
  const redirectUrl = getRedirectUrl(pathname);
  if (redirectUrl) {
    const url = request.nextUrl.clone();
    url.pathname = redirectUrl;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Simple redirect patterns for middleware (avoiding imports)
 */
function getRedirectUrl(pathname: string): string | null {
  // Legacy URL patterns
  const redirectPatterns: Record<string, string> = {
    '/item/': '/menu/items/',
    '/product/': '/menu/items/',
    '/meal/': '/menu/items/',
    '/package/': '/packages/',
    '/bundle/': '/packages/',
    '/deal/': '/packages/',
    '/manu/': '/menu/',
    '/packges/': '/packages/',
    '/pakages/': '/packages/',
  };

  // Check for exact pattern matches
  for (const [pattern, replacement] of Object.entries(redirectPatterns)) {
    if (pathname.startsWith(pattern)) {
      return pathname.replace(pattern, replacement);
    }
  }

  // Handle direct menu item access (legacy)
  const menuItemMatch = pathname.match(/^\/menu\/([^/]+)$/);
  if (menuItemMatch && !pathname.includes('/items/')) {
    return `/menu/items/${menuItemMatch[1]}`;
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
