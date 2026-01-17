import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { SecurityMiddleware, SecurityHeaders } from '@/lib/security';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Track failed login attempts (in production, use Redis or database)
const failedAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();

export async function POST(request: NextRequest) {
  try {
    // Validate request with rate limiting and security checks
    const validation = await SecurityMiddleware.validateRequest(request, {
      rateLimit: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts per 15 minutes
    });

    if (!validation.valid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Rate limit exceeded' ? 429 : 400 }
      );

      if (validation.headers) {
        Object.entries(validation.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return SecurityHeaders.applyHeaders(response);
    }

    const body = await request.json();

    // Validate input
    const { email, password } = loginSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    // Check for account lockout
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    const attempts = failedAttempts.get(clientId);

    if (
      attempts &&
      attempts.count >= 5 &&
      Date.now() - attempts.lastAttempt < 15 * 60 * 1000
    ) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          {
            error: 'Account temporarily locked due to too many failed attempts',
          },
          { status: 429 }
        )
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      // Record failed attempt
      const current = failedAttempts.get(clientId) || {
        count: 0,
        lastAttempt: 0,
      };
      failedAttempts.set(clientId, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      // Record failed attempt
      const current = failedAttempts.get(clientId) || {
        count: 0,
        lastAttempt: 0,
      };
      failedAttempts.set(clientId, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      );
    }

    // Clear failed attempts on successful login
    failedAttempts.delete(clientId);

    // Generate JWT token with shorter expiry for security using jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // 24 hours
      .sign(secret);

    // Remove sensitive data from response
    const { passwordHash, ...userResponse } = user;

    // Log successful login for security monitoring
    console.log('User login:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      ip: clientId,
    });

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });

    // Set secure httpOnly cookie for session management
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed to lax for better compatibility with redirects
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return SecurityHeaders.applyHeaders(response);
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          {
            error: 'Validation failed',
            details: error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
          { status: 400 }
        )
      );
    }

    return SecurityHeaders.applyHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
