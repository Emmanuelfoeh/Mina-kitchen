import { NextResponse } from 'next/server';
import { mockPackages } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const packageData = mockPackages.find(pkg => pkg.id === id);

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
        },
        { status: 404 }
      );
    }

    if (!packageData.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package is not available',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: packageData,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch package',
      },
      { status: 500 }
    );
  }
}
