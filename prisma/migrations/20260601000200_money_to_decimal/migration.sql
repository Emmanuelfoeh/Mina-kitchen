-- Convert all monetary columns from double precision (Float) to Decimal(10,2)
-- so currency math is exact. Postgres implicitly casts double -> numeric.

ALTER TABLE "menu_items" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "customization_options" ALTER COLUMN "priceModifier" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "packages" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "cart_items" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "cart_items" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "orders" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "orders" ALTER COLUMN "tax" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "orders" ALTER COLUMN "deliveryFee" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "orders" ALTER COLUMN "tip" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "orders" ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "order_items" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "order_items" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(10,2);

ALTER TABLE "subscriptions" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
