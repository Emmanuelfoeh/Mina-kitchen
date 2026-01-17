-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "allergens" TEXT[],
ADD COLUMN     "chefNotes" TEXT,
ADD COLUMN     "preparationTime" INTEGER,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;
