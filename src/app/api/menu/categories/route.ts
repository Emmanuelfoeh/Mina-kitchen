import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentTenantId } from '@/lib/tenant-context';

export async function GET() {
  try {
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const categories = await db.menuCategory.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
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
