'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tenant, TenantPlan, TenantStatus } from '@/types';
import { toast } from 'sonner';

const tenantFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subdomain: z
    .string()
    .min(1, 'Subdomain is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens'
    ),
  customDomain: z.string().optional(),
  businessEmail: z.string().email('Invalid email address'),
  businessPhone: z.string().min(1, 'Phone number is required'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex code'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex code'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color hex code'),
  plan: z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantFormDialogProps {
  tenant?: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TenantFormDialog({
  tenant,
  open,
  onOpenChange,
  onSuccess,
}: TenantFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!tenant;

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: tenant
      ? {
          name: tenant.name,
          subdomain: tenant.subdomain,
          customDomain: tenant.customDomain || '',
          businessEmail: tenant.businessEmail,
          businessPhone: tenant.businessPhone,
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
          accentColor: tenant.accentColor,
          plan: tenant.plan,
          status: tenant.status,
        }
      : {
          name: '',
          subdomain: '',
          customDomain: '',
          businessEmail: '',
          businessPhone: '',
          primaryColor: '#ef4444',
          secondaryColor: '#f97316',
          accentColor: '#eab308',
          plan: 'TRIAL' as TenantPlan,
          status: 'TRIAL' as TenantStatus,
        },
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    try {
      const url = isEdit
        ? `/api/admin/tenants/${tenant.id}`
        : '/api/admin/tenants';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save tenant');
      }

      toast.success(
        isEdit ? 'Tenant updated successfully' : 'Tenant created successfully'
      );
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save tenant'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Tenant' : 'Create New Tenant'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update tenant information and settings'
              : 'Add a new tenant to your platform'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="JollofHub" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomain</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input placeholder="jollofhub" {...field} />
                        <span className="text-muted-foreground text-sm">
                          .yourdomain.com
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Lowercase letters, numbers, and hyphens only
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Domain (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="www.jollofhub.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional custom domain for this tenant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>

              <FormField
                control={form.control}
                name="businessEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@jollofhub.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Brand Colors</h3>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            className="h-10 w-12"
                            {...field}
                          />
                          <Input
                            placeholder="#ef4444"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            className="h-10 w-12"
                            {...field}
                          />
                          <Input
                            placeholder="#f97316"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            className="h-10 w-12"
                            {...field}
                          />
                          <Input
                            placeholder="#eab308"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Plan & Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRIAL">Trial</SelectItem>
                        <SelectItem value="STARTER">Starter</SelectItem>
                        <SelectItem value="PROFESSIONAL">
                          Professional
                        </SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRIAL">Trial</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
