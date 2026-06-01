import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip middleware for static files, API routes we don't want to protect, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Extract subdomain or detect custom domain
  const host = hostname.split(':')[0];
  let subdomain = 'default';

  // For localhost development
  if (host === 'localhost' || host === '127.0.0.1') {
    subdomain = 'default';
  } else {
    // Check if it's a custom domain (we'll need to query the database for this in production)
    // For now, extract subdomain from format: subdomain.domain.tld
    const parts = host.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Clone the request headers and add tenant subdomain
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-subdomain', subdomain);
  requestHeaders.set('x-tenant-hostname', hostname);

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set as response header for client-side access if needed
  response.headers.set('x-tenant-subdomain', subdomain);

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
