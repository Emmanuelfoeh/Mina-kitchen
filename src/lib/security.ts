import { NextRequest } from 'next/server';
import { z } from 'zod';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token store (in production, use secure session storage)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .slice(0, 1000); // Limit length
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';

    return email.toLowerCase().trim().slice(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';

    return phone
      .replace(/[^\d\s\-\+\(\)]/g, '') // Only allow digits and common phone chars
      .trim()
      .slice(0, 20);
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any): number | null {
    const num = parseFloat(input);
    return isNaN(num) ? null : num;
  }

  /**
   * Sanitize and validate JSON input
   */
  static sanitizeJSON(input: unknown): Record<string, any> | null {
    try {
      if (typeof input === 'string') {
        const parsed = JSON.parse(input);
        return this.deepSanitizeObject(parsed);
      }
      return this.deepSanitizeObject(input);
    } catch {
      return null;
    }
  }

  /**
   * Deep sanitize object properties
   */
  private static deepSanitizeObject(obj: unknown): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number') {
      return isNaN(obj) ? null : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.deepSanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  /**
   * Check if request is within rate limit
   */
  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      // Reset or initialize
      const resetTime = now + windowMs;
      rateLimitStore.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }

    if (current.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }

    // Increment count
    current.count++;
    rateLimitStore.set(key, current);

    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Get client identifier for rate limiting
   */
  static getClientIdentifier(request: NextRequest): string {
    // Try to get real IP from headers (for production with reverse proxy)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    // Use the first available IP, fallback to 'unknown'
    const ip =
      forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';

    return ip;
  }
}

/**
 * CSRF protection utilities
 */
export class CSRFProtection {
  /**
   * Generate CSRF token
   */
  static generateToken(sessionId: string): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    csrfTokenStore.set(sessionId, { token, expires });

    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(sessionId: string, token: string): boolean {
    const stored = csrfTokenStore.get(sessionId);

    if (!stored || Date.now() > stored.expires) {
      csrfTokenStore.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  /**
   * Clean expired tokens
   */
  static cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of Array.from(csrfTokenStore.entries())) {
      if (now > data.expires) {
        csrfTokenStore.delete(sessionId);
      }
    }
  }
}

/**
 * Data encryption utilities using Web Crypto API (Edge Runtime compatible)
 */
export class DataEncryption {
  private static readonly algorithm = 'AES-GCM';
  private static readonly keyLength = 256;

  /**
   * Generate encryption key from password using PBKDF2
   */
  private static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer.slice(
          salt.byteOffset,
          salt.byteOffset + salt.byteLength
        ) as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt sensitive data
   */
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const key = await this.deriveKey(password, salt);
      const encodedData = encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encodedData
      );

      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(
        salt.length + iv.length + encrypted.byteLength
      );
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(
    encryptedData: string,
    password: string
  ): Promise<string> {
    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);

      const key = await this.deriveKey(password, salt);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way) using PBKDF2
   */
  static async hash(
    data: string,
    salt?: string
  ): Promise<{ hash: string; salt: string }> {
    const encoder = new TextEncoder();
    const saltBuffer = salt
      ? new Uint8Array(salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      : crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(data),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer.buffer.slice(
          saltBuffer.byteOffset,
          saltBuffer.byteOffset + saltBuffer.byteLength
        ) as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      512 // 64 bytes
    );

    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray, byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    const saltHex = Array.from(saltBuffer, byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');

    return {
      hash: hashHex,
      salt: saltHex,
    };
  }

  /**
   * Verify hashed data
   */
  static async verifyHash(
    data: string,
    hash: string,
    salt: string
  ): Promise<boolean> {
    const { hash: computedHash } = await this.hash(data, salt);
    return computedHash === hash;
  }
}

/**
 * Security headers utilities
 */
export class SecurityHeaders {
  /**
   * Get security headers for responses
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      // Prevent XSS attacks
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',

      // HTTPS enforcement
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
      ].join('; '),

      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Permissions policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
      ].join(', '),
    };
  }

  /**
   * Apply security headers to response
   */
  static applyHeaders(response: Response): Response {
    const headers = this.getSecurityHeaders();

    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }

    return response;
  }
}

/**
 * Input validation schemas with security enhancements
 */
export const secureValidationSchemas = {
  // Enhanced email validation
  email: z
    .string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(InputSanitizer.sanitizeEmail),

  // Enhanced password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  // Enhanced string validation
  safeString: z
    .string()
    .max(1000, 'String too long')
    .transform(InputSanitizer.sanitizeString),

  // Enhanced phone validation
  phone: z
    .string()
    .optional()
    .transform(val => (val ? InputSanitizer.sanitizePhone(val) : undefined)),

  // Enhanced numeric validation
  safeNumber: z
    .number()
    .or(z.string().transform(val => InputSanitizer.sanitizeNumber(val)))
    .refine(val => val !== null, 'Invalid number'),

  // Enhanced JSON validation
  safeJSON: z
    .any()
    .transform(InputSanitizer.sanitizeJSON)
    .refine(val => val !== null, 'Invalid JSON data'),
};

/**
 * Security middleware utilities
 */
export class SecurityMiddleware {
  /**
   * Validate request with rate limiting and CSRF protection
   */
  static async validateRequest(
    request: NextRequest,
    options: {
      requireCSRF?: boolean;
      rateLimit?: { maxRequests: number; windowMs: number };
      requireAuth?: boolean;
    } = {}
  ): Promise<{
    valid: boolean;
    error?: string;
    headers?: Record<string, string>;
  }> {
    const clientId = RateLimiter.getClientIdentifier(request);

    // Rate limiting
    if (options.rateLimit) {
      const { allowed, remaining, resetTime } = RateLimiter.checkRateLimit(
        clientId,
        options.rateLimit.maxRequests,
        options.rateLimit.windowMs
      );

      if (!allowed) {
        return {
          valid: false,
          error: 'Rate limit exceeded',
          headers: {
            'X-RateLimit-Limit': options.rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          },
        };
      }
    }

    // CSRF protection for state-changing operations
    if (
      options.requireCSRF &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    ) {
      const csrfToken = request.headers.get('X-CSRF-Token');
      const sessionId = request.cookies.get('session-id')?.value;

      if (
        !sessionId ||
        !csrfToken ||
        !CSRFProtection.validateToken(sessionId, csrfToken)
      ) {
        return {
          valid: false,
          error: 'Invalid CSRF token',
        };
      }
    }

    return { valid: true };
  }
}
