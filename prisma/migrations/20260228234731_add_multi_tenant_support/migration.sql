-- CreateEnum for Tenant-related enums
CREATE TYPE "TenantPlan" AS ENUM ('TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

-- Add SUPER_ADMIN to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- CreateTable: Tenant
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#FF6B35',
    "secondaryColor" TEXT NOT NULL DEFAULT '#004E89',
    "accentColor" TEXT NOT NULL DEFAULT '#F7931E',
    "businessEmail" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "description" TEXT,
    "plan" "TenantPlan" NOT NULL DEFAULT 'STARTER',
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");
CREATE UNIQUE INDEX "tenants_customDomain_key" ON "tenants"("customDomain");

-- Insert default tenant for existing data
INSERT INTO "tenants" (
    "id", 
    "name", 
    "subdomain", 
    "businessEmail", 
    "businessPhone",
    "plan",
    "status",
    "settings",
    "createdAt",
    "updatedAt"
) VALUES (
    'default_tenant_id',
    'Mina Kitchen',
    'default',
    'admin@minakitchen.com',
    '1-800-MINA-FOOD',
    'ENTERPRISE',
    'ACTIVE',
    '{}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Add tenantId columns as nullable first
ALTER TABLE "users" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "menu_categories" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "menu_items" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "packages" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "orders" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "carts" ADD COLUMN "tenantId" TEXT;

-- Update all existing records to point to default tenant
UPDATE "users" SET "tenantId" = 'default_tenant_id';
UPDATE "menu_categories" SET "tenantId" = 'default_tenant_id';
UPDATE "menu_items" SET "tenantId" = 'default_tenant_id';
UPDATE "packages" SET "tenantId" = 'default_tenant_id';
UPDATE "orders" SET "tenantId" = 'default_tenant_id';
UPDATE "carts" SET "tenantId" = 'default_tenant_id';

-- Make tenantId NOT NULL
ALTER TABLE "users" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "menu_categories" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "menu_items" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "packages" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "carts" ALTER COLUMN "tenantId" SET NOT NULL;

-- Drop existing unique constraints that need to be tenant-aware
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE "menu_categories" DROP CONSTRAINT IF EXISTS "menu_categories_name_key";
ALTER TABLE "menu_items" DROP CONSTRAINT IF EXISTS "menu_items_categoryId_name_key";
ALTER TABLE "packages" DROP CONSTRAINT IF EXISTS "packages_slug_key";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_orderNumber_key";

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packages" ADD CONSTRAINT "packages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carts" ADD CONSTRAINT "carts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new tenant-aware unique constraints
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");
CREATE UNIQUE INDEX "menu_categories_tenantId_name_key" ON "menu_categories"("tenantId", "name");
CREATE UNIQUE INDEX "menu_items_tenantId_categoryId_name_key" ON "menu_items"("tenantId", "categoryId", "name");
CREATE UNIQUE INDEX "packages_tenantId_slug_key" ON "packages"("tenantId", "slug");
CREATE UNIQUE INDEX "orders_tenantId_orderNumber_key" ON "orders"("tenantId", "orderNumber");
