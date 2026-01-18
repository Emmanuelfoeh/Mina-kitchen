import { Suspense } from 'react';
import { Metadata } from 'next';
import { PackagesTable } from '@/components/admin/packages/packages-table';
import { PackageStats } from '@/components/admin/packages/package-stats';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Package Management - Admin Dashboard',
  description: 'Manage meal packages, pricing, and availability',
};

export default function AdminPackagesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Package Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage meal packages, pricing, and availability
          </p>
        </div>
        <Link href="/admin/packages/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <PackageStats />
      </Suspense>

      {/* Packages Table */}
      <div className="rounded-lg border bg-white">
        <Suspense fallback={<div>Loading packages...</div>}>
          <PackagesTable />
        </Suspense>
      </div>
    </div>
  );
}
