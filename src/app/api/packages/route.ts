import { NextResponse } from 'next/server';
import { mockPackages } from '@/lib/mock-data';

export async function GET() {
  try {
    // Filter only active packages
    const activePackages = mockPackages.filter(pkg => pkg.isActive);

    return NextResponse.json({
      success: true,
      data: activePackages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch packages',
      },
      { status: 500 }
    );
  }
}
