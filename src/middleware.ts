import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SecurityHeaders, RateLimiter } from '@/lib/security';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('Middleware JWT_SECRET check:', {
  hasEnvVar: !!process.env.JWT_SECRET,
  secretLength: JWT_SECRET.length,
  secretPreview: JWT_SECRET.substring(0, 10) + '...',
});

/**
 * Middleware to handle URL redirects, validation, security headers, and admin authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except admin API)
  if (
    pathname.startsWith('/_next/') ||
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/')) ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to sensitive endpoints
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/orders')
  ) {
    const clientId = RateLimiter.getClientIdentifier(request);
    const { allowed, remaining, resetTime } = RateLimiter.checkRateLimit(
      clientId,
      pathname.startsWith('/api/auth/') ? 10 : 50, // Stricter limits for auth
      15 * 60 * 1000 // 15 minutes
    );

    if (!allowed) {
      const response = Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );

      response.headers.set(
        'X-RateLimit-Limit',
        pathname.startsWith('/api/auth/') ? '10' : '50'
      );
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(resetTime / 1000).toString()
      );

      return SecurityHeaders.applyHeaders(response);
    }
  }

  // Handle admin route protection
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for unified authentication token
    const authToken = request.cookies.get('auth-token')?.value;

    console.log('Admin route access attempt:', {
      pathname,
      hasToken: !!authToken,
      tokenPreview: authToken ? authToken.substring(0, 20) + '...' : 'missing',
      cookieCount: request.cookies.size,
    });

    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(authToken!, secret);

      console.log('Token decoded successfully:', {
        fullDecoded: payload,
        role: payload.role,
        userId: payload.userId,
        email: payload.email,
      });

      if (payload.role !== 'ADMIN') {
        console.log(
          'User is not admin, redirecting to login. Role found:',
          payload.role
        );
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      console.log('Admin access granted for:', pathname);
    } catch (error) {
      console.log('Token verification failed:', error);
      // Invalid token, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Handle admin API route protection
  if (pathname.startsWith('/api/admin/') && !pathname.includes('/login')) {
    const authToken =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return Response.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(authToken, secret);
      if (payload.role !== 'ADMIN') {
        return Response.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    } catch (error) {
      return Response.json({ error: 'Invalid admin token' }, { status: 401 });
    }
  }

  // Handle common redirect patterns
  const redirectUrl = getRedirectUrl(pathname);
  if (redirectUrl) {
    const url = request.nextUrl.clone();
    url.pathname = redirectUrl;
    return NextResponse.redirect(url);
  }

  // Create response with security headers
  const response = NextResponse.next();
  return SecurityHeaders.applyHeaders(response);
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
