# Tenant Branding System

## Overview

The Multi-Tenant Branded Frontend enables each restaurant/franchise to have their own unique branding, theme, and feature set based on their subscription plan. This system provides:

- **Dynamic Theme Colors**: Each tenant can customize primary, secondary, and accent colors
- **Custom Logos**: Tenants can upload and display their own logo
- **Conditional Feature Access**: Features are enabled/disabled based on tenant's plan
- **SEO Optimization**: Dynamic metadata and favicon per tenant

## Architecture

### 1. Tenant Provider (`TenantProvider`)

The `TenantProvider` wraps the entire application and provides tenant context to all components.

**Location**: `src/components/tenant/tenant-provider.tsx`

**Features**:

- Fetches tenant data based on current subdomain
- Injects CSS variables for tenant colors
- Provides hooks for accessing tenant data

**Usage**:

```tsx
// Already integrated in app/layout.tsx
<TenantProvider>
  <YourApp />
</TenantProvider>
```

### 2. Tenant Logo Component

**Location**: `src/components/tenant/tenant-logo.tsx`

Displays tenant's custom logo or falls back to a default icon with tenant's primary color.

**Props**:

- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `showName`: boolean (default: true)
- `className`: string (optional)

**Usage**:

```tsx
import { TenantLogo } from '@/components/tenant';

<TenantLogo size="lg" showName={true} />;
```

### 3. Feature Gate

**Location**: `src/components/tenant/feature-gate.tsx`

Conditionally render components based on tenant's plan.

**Plan Features**:

| Feature          | TRIAL | STARTER | PROFESSIONAL | ENTERPRISE |
| ---------------- | ----- | ------- | ------------ | ---------- |
| basic_menu       | ✅    | ✅      | ✅           | ✅         |
| basic_orders     | ✅    | ✅      | ✅           | ✅         |
| analytics        | ❌    | ✅      | ✅           | ✅         |
| marketing        | ❌    | ❌      | ✅           | ✅         |
| custom_domain    | ❌    | ❌      | ✅           | ✅         |
| advanced_reports | ❌    | ❌      | ✅           | ✅         |
| api_access       | ❌    | ❌      | ❌           | ✅         |
| white_label      | ❌    | ❌      | ❌           | ✅         |
| priority_support | ❌    | ❌      | ❌           | ✅         |

**Component Usage**:

```tsx
import { FeatureGate } from '@/components/tenant';

<FeatureGate feature="analytics" showUpgradeMessage={true}>
  <AnalyticsDashboard />
</FeatureGate>;
```

**Hook Usage**:

```tsx
import { useFeatureGate } from '@/components/tenant';

const hasMarketing = useFeatureGate('marketing');

if (hasMarketing) {
  // Show marketing tools
}
```

### 4. Tenant Context Hook

**Location**: `src/components/tenant/tenant-provider.tsx`

Access tenant data and branding in any component.

**Usage**:

```tsx
import { useTenantContext } from '@/components/tenant';

function MyComponent() {
  const { tenant, branding, isLoading } = useTenantContext();

  return (
    <div style={{ color: branding?.primaryColor }}>
      Welcome to {branding?.name}
    </div>
  );
}
```

### 5. Tenant Feature Hook

Access tenant plan and feature availability.

**Usage**:

```tsx
import { useTenantFeature } from '@/components/tenant';

function MyComponent() {
  const { plan, status, hasFeature, canUseFeature } = useTenantFeature();

  // Check if feature exists in plan
  const hasApi = hasFeature('api_access');

  // Check if tenant can use feature (includes status and trial checks)
  const canUseApi = canUseFeature('api_access');

  return <div>Current plan: {plan}</div>;
}
```

## CSS Variables

The system automatically injects CSS variables that you can use in your stylesheets:

```css
:root {
  --tenant-primary: #ef4444; /* Tenant's primary color */
  --tenant-secondary: #f97316; /* Tenant's secondary color */
  --tenant-accent: #eab308; /* Tenant's accent color */
}
```

**Usage in Components**:

```tsx
<div
  className="bg-[var(--tenant-primary)] text-white"
  style={{ borderColor: 'var(--tenant-accent)' }}
>
  Branded Content
</div>
```

## Dynamic Metadata

**Location**: `src/lib/tenant-metadata.ts`

Generate tenant-specific SEO metadata for pages.

**Usage**:

```tsx
import { Metadata } from 'next';
import { generateTenantMetadata } from '@/lib/tenant-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateTenantMetadata('Custom Page Title', 'Custom page description');
}
```

**Generated Metadata Includes**:

- Title with tenant name
- Description with tenant context
- OpenGraph tags with tenant logo
- Twitter card with tenant branding
- Dynamic favicon from tenant settings

## Navigation Integration

The navigation components have been updated to use tenant branding:

**Main Navigation** (`src/components/navigation/main-nav.tsx`):

- Uses `TenantLogo` component
- Displays tenant's logo and name

**Footer** (`src/components/navigation/footer.tsx`):

- Shows tenant's business contact information
- Displays tenant name in copyright notice

## Example: Admin Dashboard

**Location**: `src/app/admin/dashboard/page.tsx`

Shows how to combine multiple tenant features:

- Dynamic page metadata
- Feature-gated components
- Plan-based UI rendering

```tsx
import { TenantDashboardFeatures } from '@/components/tenant';

export default function AdminDashboard() {
  return <TenantDashboardFeatures />;
}
```

## Subdomain Routing

The system uses middleware to extract the tenant subdomain:

**Middleware** (`middleware.ts`):

- Extracts subdomain from hostname
- Sets `x-tenant-subdomain` header
- Makes tenant information available to all routes

**Example Subdomains**:

- `app.yourdomain.com` → Default tenant
- `jollofhub.yourdomain.com` → JollofHub tenant
- `localhost` → Default tenant (for development)

## Testing Tenant Branding

### Development Setup

1. **Create Test Tenants**: Use the tenant management API to create test tenants

   ```bash
   curl -X POST http://localhost:3000/api/admin/tenants \
     -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "JollofHub",
       "subdomain": "jollofhub",
       "primaryColor": "#dc2626",
       "secondaryColor": "#f59e0b",
       "accentColor": "#10b981",
       "businessEmail": "contact@jollofhub.com",
       "businessPhone": "+1234567890"
     }'
   ```

2. **Update /etc/hosts**: Add local subdomain entries

   ```
   127.0.0.1 jollofhub.localhost
   127.0.0.1 app.localhost
   ```

3. **Access Tenant Sites**:
   - http://app.localhost:3000 → Default tenant
   - http://jollofhub.localhost:3000 → JollofHub tenant

### Verification Checklist

- [ ] Logo changes based on tenant
- [ ] Primary color reflects in navigation
- [ ] Footer shows tenant contact info
- [ ] CSS variables are updated
- [ ] Features are gated based on plan
- [ ] Metadata includes tenant name
- [ ] Trial expiration is enforced

## Best Practices

1. **Always Use Context**: Access tenant data through `useTenantContext()` instead of direct API calls

2. **Feature Gates**: Wrap premium features in `<FeatureGate>` components

3. **CSS Variables**: Use `var(--tenant-primary)` for dynamic theming instead of hardcoded colors

4. **Loading States**: TenantProvider handles loading, but check `isLoading` in your components

5. **Fallbacks**: Always provide fallback values for tenant data

   ```tsx
   const tenantName = branding?.name || 'Mina Kitchen';
   ```

6. **Server Components**: Use `getCurrentTenant()` from `src/lib/tenant-context.ts` in Server Components

## API Endpoints

### Public Tenant API

- `GET /api/tenant/current` - Get current tenant branding (public)

### Super Admin APIs

- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create new tenant
- `GET /api/admin/tenants/[id]` - Get tenant details
- `PATCH /api/admin/tenants/[id]` - Update tenant
- `DELETE /api/admin/tenants/[id]` - Delete tenant

## Future Enhancements

- [ ] Custom CSS per tenant
- [ ] Custom font uploads
- [ ] Email template branding
- [ ] White-label mobile apps
- [ ] Tenant-specific translations
- [ ] Custom domain SSL management
- [ ] Tenant analytics dashboard
