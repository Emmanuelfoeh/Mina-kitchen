'use client';

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    addresses: number;
  };
}

interface UsersResponse {
  users: UserItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const roleColors: Record<string, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-700 border-blue-200',
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
};

const statusColors = {
  verified: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export function UsersTable() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<
    UsersResponse['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: 'desc',
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserStatus(userId: string, isVerified: boolean) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified }),
      });

      if (response.ok) {
        // Refresh users list
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  }

  async function updateUserRole(userId: string, role: 'CUSTOMER' | 'ADMIN') {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        // Refresh users list
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }

  async function bulkUpdateStatus(isVerified: boolean) {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          isVerified,
          bulkAction: true,
        }),
      });

      if (response.ok) {
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to bulk update users:', error);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Listen for search input changes
  useEffect(() => {
    const searchInput = document.getElementById(
      'search-users'
    ) as HTMLInputElement;
    if (searchInput) {
      const handleSearch = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setSearchTerm(target.value);
        setCurrentPage(1); // Reset to first page on search
      };

      searchInput.addEventListener('input', handleSearch);
      return () => searchInput.removeEventListener('input', handleSearch);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 p-4"
          >
            <div className="h-4 w-4 rounded bg-gray-200"></div>
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mx-6 mt-6 flex items-center gap-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <span className="text-sm font-medium text-orange-800">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}{' '}
            selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkUpdateStatus(true)}
              className="bg-white"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Activate Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkUpdateStatus(false)}
              className="bg-white"
            >
              <UserX className="mr-2 h-4 w-4" />
              Deactivate Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUsers([])}
              className="bg-white"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">
                <Checkbox
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map(user => {
                return (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={checked =>
                          handleSelectUser(user.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          roleColors[user.role] || 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {user.role === 'ADMIN' && (
                          <Shield className="mr-1 h-3 w-3" />
                        )}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          user.isVerified
                            ? statusColors.verified
                            : statusColors.pending
                        )}
                      >
                        {user.isVerified ? 'Active' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{user._count.orders}</div>
                      <div className="text-xs text-gray-500">
                        {user._count.addresses} address
                        {user._count.addresses !== 1 ? 'es' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${user.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${user.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateUserStatus(user.id, !user.isVerified)
                            }
                          >
                            {user.isVerified ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate User
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateUserRole(
                                user.id,
                                user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
                              )
                            }
                          >
                            {user.role === 'ADMIN' ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 pb-6">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}{' '}
            of {pagination.totalCount} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
