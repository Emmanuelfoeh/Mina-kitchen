'use client';

import { FeatureGate, useFeatureGate } from '@/components/tenant/feature-gate';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTenantFeature } from '@/components/tenant/tenant-provider';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
} from 'lucide-react';

export function TenantDashboardFeatures() {
  const { plan, status } = useTenantFeature();
  const hasMarketingTools = useFeatureGate('marketing');
  const hasAdvancedReports = useFeatureGate('advanced_reports');

  return (
    <div className="space-y-6">
      {/* Plan Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Features</h2>
          <p className="text-muted-foreground">
            Access features based on your plan
          </p>
        </div>
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {plan} Plan
        </Badge>
      </div>

      {/* Always Available Features */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basic Menu</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Manage your menu items and categories
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <CardDescription>View and manage customer orders</CardDescription>
          </CardContent>
        </Card>

        <FeatureGate feature="analytics">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <LineChart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <CardDescription>Track performance metrics</CardDescription>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>

      {/* Premium Features Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Premium Features</h3>

        <FeatureGate
          feature="marketing"
          fallback={
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">Marketing Tools</CardTitle>
                <CardDescription>
                  Available on Professional and Enterprise plans
                </CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Marketing Tools
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Email campaigns, promotions, and customer engagement
              </CardDescription>
            </CardContent>
          </Card>
        </FeatureGate>

        <FeatureGate feature="advanced_reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Advanced Reports
              </CardTitle>
              <BarChart3 className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed sales reports, customer insights, and forecasting
              </CardDescription>
            </CardContent>
          </Card>
        </FeatureGate>

        <FeatureGate feature="api_access">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Access</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Integrate with third-party services and build custom
                integrations
              </CardDescription>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>

      {/* Conditional Rendering Example */}
      {hasMarketingTools && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
          <p className="text-sm text-green-800 dark:text-green-200">
            🎉 Marketing tools are enabled for your account!
          </p>
        </div>
      )}

      {!hasAdvancedReports && (
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📊 Upgrade to Professional or Enterprise to unlock advanced
            reporting features.
          </p>
        </div>
      )}
    </div>
  );
}
