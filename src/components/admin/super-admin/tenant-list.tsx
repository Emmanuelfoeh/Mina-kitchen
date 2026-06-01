'use client';

import { useState } from 'react';
import { useTenants } from '@/hooks/use-tenant';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react';
import { Tenant, TenantStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TenantListProps {
  onCreateTenant: () => void;
  onEditTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenant: Tenant) => void;
  onToggleStatus: (tenant: Tenant) => void;
}

const statusColors: Record<TenantStatus, string> = {
  TRIAL: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function TenantList({
  onCreateTenant,
  onEditTenant,
  onDeleteTenant,
  onToggleStatus,
}: TenantListProps) {
  const { data: tenants, isLoading } = useTenants();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTenants = tenants?.filter(
    tenant =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.businessEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>
              Manage all tenants in your platform
            </CardDescription>
          </div>
          <Button onClick={onCreateTenant}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants && filteredTenants.length > 0 ? (
                filteredTenants.map(tenant => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{tenant.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {tenant.businessEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted rounded px-2 py-1 text-xs">
                        {tenant.subdomain}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tenant.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[tenant.status]}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(tenant.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEditTenant(tenant)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(tenant)}
                          >
                            {tenant.status === 'ACTIVE' ||
                            tenant.status === 'TRIAL' ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteTenant(tenant)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No tenants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
