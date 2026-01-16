import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditUserForm } from '@/components/admin/users/edit-user-form';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

async function getUserDetails(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/${userId}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await getUserDetails(params.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/customers/${user.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-500">
            Update user account details and permissions
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-2xl">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="mb-4 h-6 w-1/4 rounded bg-gray-200"></div>
                <div className="space-y-3">
                  <div className="h-10 rounded bg-gray-200"></div>
                  <div className="h-10 rounded bg-gray-200"></div>
                  <div className="h-10 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          }
        >
          <EditUserForm user={user} />
        </Suspense>
      </div>
    </div>
  );
}
