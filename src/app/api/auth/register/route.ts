import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getTenantFromHostname } from '@/lib/tenant';
import { userSchema, passwordSchema } from '@/lib/validations';
import { SecurityMiddleware, SecurityHeaders } from '@/lib/security';
import { z } from 'zod';

const registerSchema = userSchema
  .extend({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  try {
    // Validate request with rate limiting and security checks
    const validation = await SecurityMiddleware.validateRequest(request, {
      rateLimit: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 registrations per 15 minutes
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

    // Validate and sanitize input
    const validatedData = registerSchema.parse(body);
    const { email, password, name, phone } = validatedData;
    const normalizedEmail = email.toLowerCase();

    // Resolve the tenant (store) this registration is being made against.
    const hostname =
      request.headers.get('x-tenant-hostname') ||
      request.headers.get('host') ||
      '';
    const tenant = await getTenantFromHostname(hostname);

    if (!tenant) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json({ error: 'Store not found' }, { status: 404 })
      );
    }

    // Check if user already exists within this tenant
    const existingUser = await db.user.findFirst({
      where: { tenantId: tenant.id, email: normalizedEmail },
    });

    if (existingUser) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      );
    }

    // Hash password with high cost factor
    const hashedPassword = await bcrypt.hash(password, 14);

    // Create user scoped to the tenant. role/isVerified are server-controlled.
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        phone,
        passwordHash: hashedPassword,
        tenantId: tenant.id,
      },
      include: {
        addresses: true,
      },
    });

    // Remove sensitive data from response
    const userResponse = { ...user };
    delete (userResponse as { passwordHash?: string }).passwordHash;

    // Log registration for security monitoring (no PII).
    console.log('User registration:', {
      userId: user.id,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
    });

    return SecurityHeaders.applyHeaders(
      NextResponse.json({
        success: true,
        data: {
          user: userResponse,
          message: 'Registration successful. Please verify your email.',
        },
      })
    );
  } catch (error) {
    console.error('Registration error:', error);

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
