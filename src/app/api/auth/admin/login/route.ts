// This endpoint is deprecated.
// Admin users should use the regular login endpoint at /api/auth/login
// The system will automatically redirect admin users to the admin dashboard based on their role.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint is deprecated. Please use /api/auth/login for all user authentication.',
      redirectTo: '/api/auth/login',
    },
    { status: 410 } // Gone
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error:
        'This endpoint is deprecated. Please use /api/auth/login for all user authentication.',
      redirectTo: '/api/auth/login',
    },
    { status: 410 } // Gone
  );
}
