import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Always run on request — never cache a health probe.
export const dynamic = 'force-dynamic';

/**
 * Liveness/readiness probe for uptime monitors and load balancers.
 * Returns 200 only when the database is reachable, 503 otherwise.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', error: 'Database unreachable' },
      { status: 503 }
    );
  }
}
