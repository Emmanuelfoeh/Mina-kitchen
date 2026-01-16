import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { userSchema, passwordSchema } from '@/lib/validations';
import {
  SecurityMiddleware,
  SecurityHeaders,
  DataEncryption,
} from '@/lib/security';
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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
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

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash: hashedPassword,
      },
      include: {
        addresses: true,
      },
    });

    // Remove sensitive data from response
    const { passwordHash, ...userResponse } = user;

    // Log registration for security monitoring
    console.log('User registration:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
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
