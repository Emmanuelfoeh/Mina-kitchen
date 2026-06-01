'use client';

import { ReactNode } from 'react';
import { useTenantFeature } from './tenant-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeMessage?: boolean;
}

/**
 * Component that conditionally renders content based on tenant's plan
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradeMessage = true,
}: FeatureGateProps) {
  const { canUseFeature, plan } = useTenantFeature();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradeMessage) {
    return (
      <Alert className="my-4">
        <Lock className="h-4 w-4" />
        <AlertTitle>Feature Locked</AlertTitle>
        <AlertDescription>
          This feature is not available on your current plan ({plan}).
          <Link href="/admin/settings/billing" className="ml-2 underline">
            Upgrade your plan
          </Link>{' '}
          to unlock this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Hook-based feature gate for conditional logic
 */
export function useFeatureGate(feature: string): boolean {
  const { canUseFeature } = useTenantFeature();
  return canUseFeature(feature);
}
