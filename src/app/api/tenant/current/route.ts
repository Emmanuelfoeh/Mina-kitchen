import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant-context';

/**
 * GET /api/tenant/current - Get current tenant information
 * This is accessible to all users (authenticated or not) for displaying branding
 */
export async function GET() {
  try {
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Return tenant information (excluding sensitive data)
    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        accentColor: tenant.accentColor,
        businessEmail: tenant.businessEmail,
        businessPhone: tenant.businessPhone,
        description: tenant.description,
        // Don't expose plan, status, billing info to public
      },
    });
  } catch (error) {
    console.error('Get current tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}
