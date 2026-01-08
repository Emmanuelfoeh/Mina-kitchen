import { NextRequest, NextResponse } from 'next/server';
import { mockMenuItems } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'active';

    let filteredItems = mockMenuItems.filter(item => item.status === status);

    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(
        item => item.category.name.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu items',
      },
      { status: 500 }
    );
  }
}
