import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getTenantFromHostname } from '@/lib/tenant';

/**
 * Returns the signing secret as bytes, failing closed if it is missing or weak.
 * Never falls back to a hardcoded default — an unset secret must break auth,
 * not silently accept forgeable tokens.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET environment variable must be set and at least 32 characters'
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  tenantId: string;
}

/**
 * Resolve the tenant id for the current request from the hostname headers set
 * by middleware (falling back to the raw Host header).
 */
async function getRequestTenantId(
  request: NextRequest
): Promise<string | null> {
  const hostname =
    request.headers.get('x-tenant-hostname') ||
    request.headers.get('host') ||
    '';
  if (!hostname) return null;
  const tenant = await getTenantFromHostname(hostname);
  return tenant?.id ?? null;
}

/**
 * Resolve and validate the authenticated user for a request.
 *
 * Authentication is tenant-bound: a token issued on one tenant cannot be
 * replayed against another. SUPER_ADMIN is the only role allowed to operate
 * across tenants (it manages the platform), so it is exempt from the binding.
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify token using jose (Edge Runtime compatible)
    const { payload } = await jwtVerify(token, getJwtSecret());

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      return null;
    }

    // SUPER_ADMIN operates across all tenants and is not tenant-bound.
    if (user.role === 'SUPER_ADMIN') {
      return user;
    }

    // The token must have been issued for this user's tenant.
    const tokenTenantId = payload.tenantId as string | undefined;
    if (!tokenTenantId || tokenTenantId !== user.tenantId) {
      return null;
    }

    // The user may only act on the tenant the request was made against.
    // Fail closed if the current tenant cannot be resolved or does not match.
    const currentTenantId = await getRequestTenantId(request);
    if (!currentTenantId || currentTenantId !== user.tenantId) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

function unauthorized() {
  return new Response(JSON.stringify({ error: 'Authentication required' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function forbidden(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function requireAuth<T = any>(
  handler: (
    request: NextRequest,
    user: AuthUser,
    context?: T
  ) => Promise<Response>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorized();
    }

    return handler(request, user, context);
  };
}

/**
 * Require an ADMIN or SUPER_ADMIN. SUPER_ADMIN is included because it is the
 * highest privilege level — locking it out of admin endpoints would be wrong.
 */
export function requireAdmin<T = any>(
  handler: (
    request: NextRequest,
    user: AuthUser,
    context?: T
  ) => Promise<Response>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorized();
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return forbidden('Admin access required');
    }

    return handler(request, user, context);
  };
}

/**
 * Require a platform SUPER_ADMIN. Use for cross-tenant management endpoints.
 */
export function requireSuperAdmin<T = any>(
  handler: (
    request: NextRequest,
    user: AuthUser,
    context?: T
  ) => Promise<Response>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorized();
    }

    if (user.role !== 'SUPER_ADMIN') {
      return forbidden('Super admin access required');
    }

    return handler(request, user, context);
  };
}
