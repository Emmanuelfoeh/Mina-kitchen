'use client';

import { useState } from 'react';
import { Tenant } from '@/types';
import { TenantStatistics } from '@/components/admin/super-admin/tenant-statistics';
import { TenantList } from '@/components/admin/super-admin/tenant-list';
import { TenantFormDialog } from '@/components/admin/super-admin/tenant-form-dialog';
import { DeleteTenantDialog } from '@/components/admin/super-admin/delete-tenant-dialog';
import { ToggleStatusDialog } from '@/components/admin/super-admin/toggle-status-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuperAdminPage() {
  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Protection: Only SUPER_ADMIN can access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?callbackUrl=/admin/super-admin');
      return;
    }
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/admin');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Don't render anything if not authorized
  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setFormDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormDialogOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setStatusDialogOpen(true);
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage tenants, monitor platform statistics, and oversee operations
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TenantStatistics />
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <TenantList
            onCreateTenant={handleCreateTenant}
            onEditTenant={handleEditTenant}
            onDeleteTenant={handleDeleteTenant}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TenantFormDialog
        tenant={selectedTenant}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteTenantDialog
        tenant={selectedTenant}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />

      <ToggleStatusDialog
        tenant={selectedTenant}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
