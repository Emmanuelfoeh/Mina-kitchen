/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `packages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");
