import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations';
import { SecurityMiddleware, SecurityHeaders } from '@/lib/security';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Validate request with rate limiting and security checks
    const validation = await SecurityMiddleware.validateRequest(request, {
      rateLimit: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
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
    const validatedData = contactFormSchema.parse(body);

    // Additional security checks
    if (!validatedData.name || !validatedData.email || !validatedData.message) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { error: 'Name, email, and message are required' },
          { status: 400 }
        )
      );
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /onclick/i,
      /onerror/i,
      /<[^>]*>/,
      /eval\(/i,
    ];

    const textToCheck = `${validatedData.name} ${validatedData.message} ${validatedData.subject}`;
    if (suspiciousPatterns.some(pattern => pattern.test(textToCheck))) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          { error: 'Invalid content detected' },
          { status: 400 }
        )
      );
    }

    // Record receipt without logging PII (name/email/message).
    // TODO: persist the inquiry and/or send an email via the notification layer.
    console.log('Contact form submission received', {
      subject: validatedData.subject,
      timestamp: new Date().toISOString(),
    });

    return SecurityHeaders.applyHeaders(
      NextResponse.json(
        {
          message:
            'Your inquiry has been submitted successfully. We will get back to you within 24 hours.',
          success: true,
        },
        { status: 200 }
      )
    );
  } catch (error) {
    console.error('Error processing contact form:', error);

    if (error instanceof z.ZodError) {
      return SecurityHeaders.applyHeaders(
        NextResponse.json(
          {
            error: 'Invalid input data',
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
      NextResponse.json(
        { error: 'Internal server error. Please try again later.' },
        { status: 500 }
      )
    );
  }
}
