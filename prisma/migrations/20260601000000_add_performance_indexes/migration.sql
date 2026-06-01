-- Add indexes for tenant-scoped listing/sorting and unindexed foreign keys.
-- Postgres does NOT auto-index FK columns, and composite UNIQUE constraints
-- only help queries whose filter matches the constraint's leading column.

-- CreateIndex
CREATE INDEX "users_tenantId_createdAt_idx" ON "users"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX "menu_items_tenantId_createdAt_idx" ON "menu_items"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "menu_items_categoryId_idx" ON "menu_items"("categoryId");

-- CreateIndex
CREATE INDEX "customization_options_customizationId_idx" ON "customization_options"("customizationId");

-- CreateIndex
CREATE INDEX "packages_tenantId_createdAt_idx" ON "packages"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "package_items_packageId_idx" ON "package_items"("packageId");

-- CreateIndex
CREATE INDEX "package_items_menuItemId_idx" ON "package_items"("menuItemId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_items_menuItemId_idx" ON "cart_items"("menuItemId");

-- CreateIndex
CREATE INDEX "orders_tenantId_createdAt_idx" ON "orders"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_deliveryAddressId_idx" ON "orders"("deliveryAddressId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_menuItemId_idx" ON "order_items"("menuItemId");
