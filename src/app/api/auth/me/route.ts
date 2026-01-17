import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token using jose (Edge Runtime compatible)
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { passwordHash, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
