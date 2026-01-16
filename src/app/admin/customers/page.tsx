import { Suspense } from 'react';
import { Plus, Download, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UsersTable } from '@/components/admin/users/users-table';
import { AddUserModal } from '@/components/admin/users/add-user-modal';

export default function CustomersPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="mt-1 text-gray-500">
            Manage customer accounts, roles, and access permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <Download className="h-4 w-4" />
            Export Users
          </Button>
          <AddUserModal>
            <Button className="gap-2 bg-[#f97316] text-white hover:bg-[#ea580c]">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </AddUserModal>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search by name, email, or ID..."
            className="pl-10"
            id="search-users"
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="CUSTOMER">Customers</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Suspense
          fallback={
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          }
        >
          <UsersTable />
        </Suspense>
      </div>
    </div>
  );
}
