import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

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
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
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
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(request, user, context);
  };
}

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
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, user, context);
  };
}
