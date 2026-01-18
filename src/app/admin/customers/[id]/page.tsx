import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfileDetails } from '@/components/admin/users/user-profile-details';

interface UserDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
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

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;
  const user = await getUserDetails(id);

  if (!user) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const roleColors = {
    CUSTOMER: 'bg-blue-100 text-blue-700 border-blue-200',
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const statusColors = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-500">View and manage user account details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="mt-2 flex justify-center gap-2">
                <Badge
                  variant="outline"
                  className={roleColors[user.role as keyof typeof roleColors]}
                >
                  {user.role}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    user.isVerified
                      ? statusColors.verified
                      : statusColors.pending
                  }
                >
                  {user.isVerified ? 'Active' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                <span>{user._count.orders} orders placed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  {user._count.addresses} saved address
                  {user._count.addresses !== 1 ? 'es' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/customers/${user.id}/edit`}>
                <Button variant="outline" className="w-full justify-start">
                  Edit Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Toggle user status
                  // This would be implemented with a proper API call
                }}
              >
                {user.isVerified ? 'Deactivate User' : 'Activate User'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Toggle user role
                  // This would be implemented with a proper API call
                }}
              >
                {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="mb-4 h-6 w-1/4 rounded bg-gray-200"></div>
                  <div className="space-y-3">
                    <div className="h-4 rounded bg-gray-200"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            }
          >
            <UserProfileDetails user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
