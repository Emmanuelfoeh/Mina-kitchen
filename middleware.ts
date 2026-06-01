import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

/**
 * Edge-safe JWT verification for coarse, page-level route gating.
 *
 * This does NOT touch the database (middleware runs on the Edge runtime).
 * It only validates the token signature and reads the role claim. The real
 * per-tenant data authorization is enforced in the API layer by
 * `getAuthUser`, which additionally binds the user to the request's tenant.
 * Fails closed: a missing/weak secret or invalid token yields null (denied).
 */
async function verifyToken(token: string): Promise<JWTPayload | null> {
  const secretStr = process.env.JWT_SECRET;
  if (!secretStr || secretStr.length < 32) {
    return null;
  }
  try {
    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip middleware for static files, health checks, and Next.js internals
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
    // Check if it's a custom domain (resolved to a tenant in the API layer).
    // For now, extract subdomain from format: subdomain.domain.tld
    const parts = host.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Server-side gate for the admin area. The admin login page is exempt so an
  // unauthenticated user can reach it. Everything else under /admin requires a
  // valid ADMIN or SUPER_ADMIN token; /admin/super-admin requires SUPER_ADMIN.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth-token')?.value;
    const payload = token ? await verifyToken(token) : null;
    const role = payload?.role as string | undefined;
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/admin/super-admin') && role !== 'SUPER_ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Clone the request headers and add tenant context for downstream handlers
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
