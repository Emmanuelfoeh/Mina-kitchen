'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tenant, TenantStatus } from '@/types';
import { toast } from 'sonner';

interface ToggleStatusDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ToggleStatusDialog({
  tenant,
  open,
  onOpenChange,
  onSuccess,
}: ToggleStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!tenant) return null;

  const isActive = tenant.status === 'ACTIVE' || tenant.status === 'TRIAL';
  const newStatus: TenantStatus = isActive ? 'SUSPENDED' : 'ACTIVE';
  const action = isActive ? 'suspend' : 'activate';

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} tenant`);
      }

      toast.success(`Tenant ${action}d successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${action} tenant`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Suspend' : 'Activate'} Tenant
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                Are you sure you want to suspend <strong>{tenant.name}</strong>?
                Their users will not be able to access the platform until
                reactivated.
              </>
            ) : (
              <>
                Are you sure you want to activate <strong>{tenant.name}</strong>
                ? Their users will regain access to the platform.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle} disabled={isLoading}>
            {isLoading
              ? `${action.charAt(0).toUpperCase() + action.slice(1)}ing...`
              : isActive
                ? 'Suspend'
                : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
