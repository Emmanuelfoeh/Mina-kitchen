import { Metadata } from 'next';
import { PackageForm } from '@/components/admin/packages/package-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Package - Admin Dashboard',
  description: 'Create a new meal package',
};

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/packages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Package
          </h1>
          <p className="mt-2 text-gray-600">
            Create a new meal package with customizable items and pricing
          </p>
        </div>
      </div>

      {/* Package Form */}
      <div className="rounded-lg border bg-white p-6">
        <PackageForm />
      </div>
    </div>
  );
}
