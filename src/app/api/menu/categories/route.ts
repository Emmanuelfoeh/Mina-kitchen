import { NextResponse } from 'next/server';
import { mockCategories } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockCategories.filter(category => category.isActive),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
