import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { PackageForm } from '@/components/admin/packages/package-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditPackagePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditPackagePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Edit Package ${id} - Admin Dashboard`,
    description: 'Edit meal package details and configuration',
  };
}

export default async function EditPackagePage({
  params,
}: EditPackagePageProps) {
  const { id } = await params;

  // Get cookies for authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  // Fetch package data with authentication
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/packages/${id}`,
    {
      cache: 'no-store',
      headers: {
        Cookie: `auth-token=${authToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    notFound();
  }

  const { data: packageData } = await response.json();

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
            Edit Package: {packageData.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Update package details, items, and pricing
          </p>
        </div>
      </div>

      {/* Package Form */}
      <div className="rounded-lg border bg-white p-6">
        <PackageForm initialData={packageData} />
      </div>
    </div>
  );
}
