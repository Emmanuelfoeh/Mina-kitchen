/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,name]` on the table `menu_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_categoryId_name_key" ON "menu_items"("categoryId", "name");
