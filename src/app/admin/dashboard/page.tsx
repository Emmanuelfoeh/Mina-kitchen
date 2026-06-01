import { Metadata } from 'next';
import { generateTenantMetadata } from '@/lib/tenant-metadata';
import { TenantDashboardFeatures } from '@/components/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return generateTenantMetadata(
    'Dashboard - Tenant Features',
    'Manage your restaurant with tenant-specific features'
  );
}

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <TenantDashboardFeatures />
    </div>
  );
}
