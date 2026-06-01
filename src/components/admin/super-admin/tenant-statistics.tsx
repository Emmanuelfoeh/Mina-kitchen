'use client';

import { useTenants } from '@/hooks/use-tenant';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
} from 'lucide-react';

export function TenantStatistics() {
  const { data: tenants, isLoading } = useTenants();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalTenants: tenants?.length || 0,
    activeTenants: tenants?.filter(t => t.status === 'ACTIVE').length || 0,
    trialTenants: tenants?.filter(t => t.status === 'TRIAL').length || 0,
    suspendedTenants:
      tenants?.filter(t => t.status === 'SUSPENDED').length || 0,
    totalUsers:
      tenants?.reduce((sum, t) => sum + (t._count?.users || 0), 0) || 0,
    totalOrders:
      tenants?.reduce((sum, t) => sum + (t._count?.orders || 0), 0) || 0,
    totalMenuItems:
      tenants?.reduce((sum, t) => sum + (t._count?.menuItems || 0), 0) || 0,
    planDistribution: {
      TRIAL: tenants?.filter(t => t.plan === 'TRIAL').length || 0,
      STARTER: tenants?.filter(t => t.plan === 'STARTER').length || 0,
      PROFESSIONAL: tenants?.filter(t => t.plan === 'PROFESSIONAL').length || 0,
      ENTERPRISE: tenants?.filter(t => t.plan === 'ENTERPRISE').length || 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeTenants} active, {stats.trialTenants} trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-muted-foreground text-xs">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-muted-foreground text-xs">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
            <p className="text-muted-foreground text-xs">Total catalog size</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Tenants by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.planDistribution).map(([plan, count]) => {
                const percentage =
                  stats.totalTenants > 0
                    ? Math.round((count / stats.totalTenants) * 100)
                    : 0;

                return (
                  <div key={plan} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{plan}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Tenant status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-2xl font-bold">
                  {stats.activeTenants}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Trial</span>
                </div>
                <span className="text-2xl font-bold">{stats.trialTenants}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Suspended</span>
                </div>
                <span className="text-2xl font-bold">
                  {stats.suspendedTenants}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants */}
      <Card>
        <CardHeader>
          <CardTitle>Top Active Tenants</CardTitle>
          <CardDescription>Sorted by number of orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants
              ?.filter(t => t.status === 'ACTIVE' || t.status === 'TRIAL')
              .sort((a, b) => (b._count?.orders || 0) - (a._count?.orders || 0))
              .slice(0, 5)
              .map(tenant => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{ backgroundColor: tenant.primaryColor }}
                    />
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {tenant.subdomain}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{tenant._count?.orders || 0}</p>
                    <p className="text-muted-foreground text-xs">orders</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
